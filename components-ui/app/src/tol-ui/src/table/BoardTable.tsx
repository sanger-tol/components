/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  ANONYMOUS_USER_QUERY_KEY,
  AttributeTitle,
  BOARD_ENTITIES,
  clearTableConfigLocalStorage,
  configsAreEqual,
  createTableConfigHandlers,
  fetchActions,
  getInitialDiffState,
  handleFirstLoadDiffState,
  handleSavedDiffReset,
  MESSAGE_TYPE,
  PopUpMessage,
  RemoteTable,
  RemovedColumnsModal,
  setTableConfigLocalStorage,
  TOL_DS,
  updateComponentConfigAndUpsert,
  useAuth,
  useBoard,
  useQueryData,
  normaliseCaps,
} from "..";
import type {
  ITableConfigSave,
  PVisualisation,
  IDiffState,
  IComponentConfig,
} from "..";

export interface PBoardTable extends PVisualisation {
  config: ITableConfigSave;
}

export function BoardTable(props: PBoardTable) {
  const { id, boardDataSource, zone, objectType, actionsDataSource } = props;

  const { user } = useAuth();
  const { editMode } = useBoard();

  const isLoggedIn: boolean = !!user?.id;
  const componentData = zone?.children[id];

  // Calculate sequential board number from zone.children keys
  const componentNumber = zone?.children ? Object.keys(zone.children).indexOf(id) + 1 : 1;

  const [resetKey, setResetKey] = useState<number>(0);
  const [diffState, setDiffState] = useState<IDiffState>(
    handleFirstLoadDiffState(componentData),
  );
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [removedColumnsForModal, setRemovedColumnsForModal] = useState<ReactNode[]>([]);
  const [columnsRemaining, setColumnsRemaining] = useState<number>(0);
  const diffStateRef = useRef(diffState);
  useEffect(() => {
    diffStateRef.current = diffState;
  }, [diffState]);

  const actionList = useQueryData<string[]>(
    ["actionsList", id],
    () => fetchActions(user, actionsDataSource, objectType),
    {
      enabled: !!user,
      staleTime: 0,
    },
  );

  const { data: remoteDiffState } = useQueryData<IDiffState>(
    // Fetch diff state when variables in the array change
    [
      BOARD_ENTITIES.ENTITIES.ENTITY_DIFF,
      id,
      user?.id ?? ANONYMOUS_USER_QUERY_KEY,
      String(editMode),
      String(isLoggedIn),
      String(resetKey),
    ],
    () =>
      getInitialDiffState(
        id,
        isLoggedIn,
        objectType,
        componentData?.config ?? null,
        editMode,
        componentData?.config_diff?.config || null,
      ),
    { enabled: true },
  );

  useEffect(() => {
    // Update diff state when remote diff state changes
    if (!remoteDiffState) return;

    if (!editMode && remoteDiffState.removedColumns?.length) {
      const removedColumns = remoteDiffState.removedColumns;

      // Resolve display names from enriched and saved metadata, with a readable fallback.
      const fieldMeta = componentData?.config?.fieldMeta;
      const removedColumnNodes = removedColumns.map(
        (col) => (
          <AttributeTitle
            attributeId={col}
            dataSource={TOL_DS}
            objectType={objectType}
            rename={
              fieldMeta?.dataWithDefaults?.[col]?.rename
              || fieldMeta?.data?.[col]?.rename
              || normaliseCaps(col)
            }
          />
        ),
      );

      // Store for modal display
      setRemovedColumnsForModal(removedColumnNodes);
      const remaining = (remoteDiffState.currentConfig?.fieldMeta?.order?.active?.length || 0) +
                       (remoteDiffState.currentConfig?.fieldMeta?.order?.inactive?.length || 0);
      setColumnsRemaining(remaining);

      // Create persistent warning message with "See more" button
      const warningMessage = (
        <div className="tol-removed-columns-warning-message">
          <span>Board {componentNumber} has {removedColumns.length} column(s) removed due to board owner changes</span>
          <button
            onClick={() => setModalOpen(true)}
            className="tol-removed-columns-see-more-button"
          >
            More info
          </button>
        </div>
      );

      PopUpMessage({
        type: MESSAGE_TYPE.WARNING,
        message: warningMessage,
        persist: true,
      });

      const cleanedConfig = remoteDiffState.currentConfig;
      if (cleanedConfig) {
        if (isLoggedIn) {
          updateComponentConfigAndUpsert(
            id,
            cleanedConfig,
            zone,
            boardDataSource,
            false,
            undefined,
            user?.id,
          );
        } else {
          const localStorageKey = `${BOARD_ENTITIES.ENTITIES.ENTITY_DIFF}_${id}`;
          clearTableConfigLocalStorage(localStorageKey);
          setTableConfigLocalStorage(
            localStorageKey,
            [
              "fieldMeta",
              "defaultSortByAttribute",
              "defaultSortByType",
              "filterVisibility",
              "pageSize",
            ],
            [
              cleanedConfig.fieldMeta,
              cleanedConfig.defaultSortByAttribute,
              cleanedConfig.defaultSortByType,
              cleanedConfig.filterVisibility,
              cleanedConfig.pageSize,
            ],
          );
        }
      }
    }

    // If the stored diff is identical to the base config, mark it as cleared but keep the id
    if (remoteDiffState.isRedundantDiff) {
      const diffId = componentData?.config_diff?.id;
      if (diffId) {
        componentData.config_diff = {
          id: diffId,
          config: {} as Partial<IComponentConfig>,
        };
      } else {
        componentData.config_diff = undefined;
      }
      clearTableConfigLocalStorage(
        `${BOARD_ENTITIES.ENTITIES.ENTITY_DIFF}_${id}`,
      );
    }

    setDiffState({
      ...remoteDiffState,
      hasDiff: remoteDiffState.isRedundantDiff
        ? false
        : remoteDiffState.hasDiff,
    });
  }, [
    remoteDiffState,
    editMode,
    isLoggedIn,
    id,
    zone,
    boardDataSource,
    user?.id,
  ]);

  useEffect(() => {
    // When edit mode is toggled, we want to update the diff state to
    // reflect the current config (if entering edit mode) or the diff
    // between the current config and the default config (if exiting edit mode).
    // Force remount of RemoteTable to clear its internal state.

    const nextConfig = editMode
      ? (componentData?.config ?? null)
      : componentData?.config_diff?.config || componentData?.config;

    setDiffState((prev) => ({
      ...prev,
      currentConfig:
        (structuredClone(nextConfig) as Partial<ITableConfigSave>) ?? null,
      hasDiff: !editMode && !!componentData?.config_diff?.config,
    }));

  // Only fires on edit mode changes, not on every config mutation.
  // RemoteTable syncs its state in-place via configSyncKey — no remount needed.
  }, [editMode]);

  // Create handlers for changing table config, including column resize, page size, etc.
  const {
    onConfigSave,
    onFilterVisibilityChange,
    onResizeColumn,
    onPageSizeChange,
  } = createTableConfigHandlers({
    id,
    zone,
    boardDataSource,
    editMode,
    isLoggedIn,
    userId: user?.id,
    baseConfig: componentData?.config as Partial<ITableConfigSave> | null,
    componentData,
    diffStateRef,
    setDiffState,
  });

  const onReset = async () => {
    // On reset, we clear the database or localstorage diff,
    // then reset the state to the base config (or remote diff if it exists) on the UI,
    // triggering a re-render with the default config.

    const resetLoadedDiffState = () => {
      // Clear config_diff entirely — the record has been deleted from DB
      componentData.config_diff = undefined;

      setDiffState({
        currentConfig: { ...componentData.config } as Partial<ITableConfigSave>,
        hasDiff: false,
        configDifferences: { add: [], remove: [] },
      });

      setResetKey((k: number) => k + 1);
    };

    (await handleSavedDiffReset(
      boardDataSource,
      diffState,
      componentData,
      isLoggedIn,
      user?.id,
    )) && resetLoadedDiffState();
  };

  return (
    <>
      <RemoteTable
        key={resetKey}
        {...props}
        configSyncKey={editMode ? "edit" : "view"}
        resizeableColumns={isLoggedIn}
        onReset={onReset}
        showConfigReset={
          diffState.hasDiff &&
          !configsAreEqual(diffState.currentConfig, componentData?.config)
        }
        resetConfigDifferences={diffState.configDifferences}
        advanceTab
        editableCells
        displaySource
        fields={diffState.currentConfig?.fieldMeta}
        baseFieldMeta={componentData?.config?.fieldMeta}
        pageSize={diffState.currentConfig?.pageSize}
        filterVisibility={diffState.currentConfig?.filterVisibility}
        defaultSortByAttribute={diffState.currentConfig?.defaultSortByAttribute}
        defaultSortByType={diffState.currentConfig?.defaultSortByType}
        actions={actionList.data}
        actionDataSource={actionsDataSource}
        rowSelection={actionList.data && actionList.data.length > 0}
        onConfigSave={(config) => onConfigSave({ ...config })}
        onToggleFilterVisibility={onFilterVisibilityChange}
        onPageSizeChange={onPageSizeChange}
        onResizeColumn={onResizeColumn}
        testid="board-component-table"
    />
      <RemovedColumnsModal
        open={modalOpen}
        setOpen={setModalOpen}
        boardNumber={String(componentNumber)}
        removedColumns={removedColumnsForModal}
        columnsRemaining={columnsRemaining}
      />
    </>
  );
}
