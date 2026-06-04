/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect, useRef } from "react";
import {
  RemoteTable,
  useBoard,
  useAuth,
  BOARD_ENTITIES,
  useQueryData,
  getInitialDiffState,
  fetchActions,
  ANONYMOUS_USER_QUERY_KEY,
  handleSavedDiffReset,
  handleFirstLoadDiffState,
  createTableConfigHandlers,
} from "..";
import type {
  ITableConfigSave,
  PVisualisation,
  IDiffState,
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

  const [resetKey, setResetKey] = useState<number>(0);
  const [diffState, setDiffState] = useState<IDiffState>(
    handleFirstLoadDiffState(componentData),
  );
  const diffStateRef = useRef(diffState);
  useEffect(() => { diffStateRef.current = diffState; }, [diffState]);

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
    setDiffState(remoteDiffState);
  }, [remoteDiffState]);

  useEffect(() => {
    // When edit mode is toggled, we want to update the diff state to
    // reflect the current config (if entering edit mode) or the diff
    // between the current config and the default config (if exiting edit mode).

    const nextConfig = editMode
      ? (componentData?.config ?? null)
      : componentData?.config_diff?.config || componentData?.config;

    setDiffState((prev) => ({
      ...prev,
      currentConfig:
        (structuredClone(nextConfig) as Partial<ITableConfigSave>) ?? null,
      hasDiff: !editMode && !!componentData?.config_diff?.config,
    }));

    setResetKey((k) => k + 1);
  }, [editMode]);

  // Create handlers for changing table config, including column resize, page size, etc.
  const { onConfigSave, onFilterVisibilityChange, onResizeColumn, onPageSizeChange } =
    createTableConfigHandlers({
      id,
      zone,
      boardDataSource,
      editMode,
      isLoggedIn,
      userId: user?.id,
      diffStateRef,
      setDiffState,
    });

  const onReset = async () => {
    // On reset, we clear the database or localstorage diff,
    // then reset the state to the base config (or remote diff if it exists) on the UI,
    // triggering a re-render with the default config.

    const resetLoadedDiffState = () => {
      if (diffState.hasDiff) {
        componentData.config_diff = { id: "", config: {} as ITableConfigSave };
      }

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
    <RemoteTable
      key={resetKey}
      {...props}
      resizeableColumns={editMode || false}
      onReset={onReset}
      showConfigReset={diffState.hasDiff}
      resetConfigDifferences={diffState.configDifferences}
      advanceTab
      editableCells
      displaySource
      fields={diffState.currentConfig?.fieldMeta}
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
    />
  );
}
