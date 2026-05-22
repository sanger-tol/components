/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import {
  RemoteTable,
  updateComponentConfigAndUpsert,
  deleteComponentDiff,
  useBoard,
  optimiseFieldMetaForSave,
  updateFieldMetaAttribute,
  useAuth,
  BOARD_ENTITIES,
  setTableConfigLocalStorage,
  clearTableConfigLocalStorage,
  useQueryData,
  getInitialDiffState,
  fetchActions,
  ANONYMOUS_USER_QUERY_KEY,
} from "..";
import type {
  ITableConfigSave,
  ITableDrawerSave,
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

  const actionList = useQueryData<string[]>(
    ["actionsList", id],
    () => fetchActions(user, actionsDataSource, objectType),
    {
      enabled: !!user,
      staleTime: 0,
    },
  );

  const [resetKey, setResetKey] = useState<number>(0);

  // Set initial state on mount, prioritising remote diff, 
  // then local storage diff for anonymous users, then the base config
  const [diffState, setDiffState] = useState<IDiffState>({
    currentConfig: structuredClone(
      componentData?.config_diff?.config ?? componentData?.config ?? null,
    ),
    hasDiff: !!componentData?.config_diff?.config,
    configDifferences: { add: [], remove: [] },
  });

  const { data: remoteDiffState } = useQueryData<IDiffState>(
    [
      // Call the query again, if any of these parameters change
      BOARD_ENTITIES.ENTITY_DIFF,
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
        componentData?.config,
        editMode,
        componentData?.config_diff?.config || null,
      ),
    { enabled: true },
  );

  // Update the diff state when a new remote diff is fetched
  useEffect(() => {
    if (!remoteDiffState) return;
    setDiffState(remoteDiffState);
  }, [remoteDiffState]);

  useEffect(() => {
    const nextConfig = editMode
      ? componentData?.config
      : componentData?.config_diff?.config || componentData?.config;
    setDiffState((prev) => ({
      ...prev,
      currentConfig: structuredClone(nextConfig),
      hasDiff: !editMode && !!componentData?.config_diff?.config,
    }));
    setResetKey((k) => k + 1);
  }, [editMode]);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const setHasDiff = (value: boolean) =>
    setDiffState((prev) => ({ ...prev, hasDiff: value }));

  // ── Handlers: persist changes ────────────────────────────────────────────

  const onConfigSave = (
    { fieldMeta, defaultSortByAttribute, defaultSortByType }: ITableDrawerSave,
    isLoggedIn: boolean,
  ) => {
    const newFieldMeta = optimiseFieldMetaForSave(fieldMeta);
    const nextConfig = {
      ...diffState.currentConfig,
      defaultSortByAttribute,
      defaultSortByType,
      fieldMeta: newFieldMeta,
    };
    setDiffState((prev) => ({ ...prev, currentConfig: nextConfig }));
    if (isLoggedIn) {
      updateComponentConfigAndUpsert(
        id,
        nextConfig,
        zone,
        boardDataSource,
        editMode,
        setHasDiff,
        user?.id,
      );
      return;
    }
    setTableConfigLocalStorage(
      `${BOARD_ENTITIES.ENTITY_DIFF}_${id}`,
      ["fieldMeta", "defaultSortByAttribute", "defaultSortByType"],
      [newFieldMeta, defaultSortByAttribute, defaultSortByType],
    );
    setHasDiff(true);
  };

  const onFilterVisibilityChange = (visible: boolean) => {
    const nextConfig = {
      ...diffState.currentConfig,
      filterVisibility: visible,
    };
    setDiffState((prev) => ({ ...prev, currentConfig: nextConfig }));
    updateComponentConfigAndUpsert(
      id,
      nextConfig,
      zone,
      boardDataSource,
      editMode,
      setHasDiff,
      user?.id,
    );
  };

  const onResizeColumn = (columnWidth: number, dataKey: string) => {
    const nextConfig = { ...diffState.currentConfig };
    updateFieldMetaAttribute(
      nextConfig["fieldMeta"]!,
      dataKey,
      "width",
      columnWidth,
    );
    setDiffState((prev) => ({ ...prev, currentConfig: nextConfig }));
    updateComponentConfigAndUpsert(
      id,
      nextConfig,
      zone,
      boardDataSource,
      editMode,
      setHasDiff,
      user?.id,
    );
  };

  const onPageSizeChange = (pageSize: number, isLoggedIn: boolean) => {
    const nextConfig = { ...diffState.currentConfig, pageSize };
    setDiffState((prev) => ({ ...prev, currentConfig: nextConfig }));
    if (isLoggedIn) {
      updateComponentConfigAndUpsert(
        id,
        nextConfig,
        zone,
        boardDataSource,
        editMode,
        setHasDiff,
        user?.id,
      );
      return;
    }
    setTableConfigLocalStorage(
      `${BOARD_ENTITIES.ENTITY_DIFF}_${id}`,
      "pageSize",
      pageSize,
    );
    setHasDiff(true);
  };

  // ── Reset ────────────────────────────────────────────────────────────────

  const onReset = async () => {
    const resetDiffState = () => {
      if (componentData?.config_diff) {
        componentData.config_diff = null;
      }
      setDiffState({
        currentConfig: { ...componentData.config },
        hasDiff: false,
        configDifferences: { add: [], remove: [] },
      });
      setResetKey((k: number) => k + 1);
    };

    isLoggedIn && diffState.hasDiff
      ? await deleteComponentDiff(id, boardDataSource, user?.id ?? "").then(
          () => {
            resetDiffState();
          },
        )
      : diffState.hasDiff
        ? (clearTableConfigLocalStorage(`${BOARD_ENTITIES.ENTITY_DIFF}_${id}`),
          resetDiffState())
        : null;
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
      onConfigSave={(config) => onConfigSave({ ...config }, isLoggedIn)}
      onToggleFilterVisibility={(visible: boolean) =>
        onFilterVisibilityChange(visible)
      }
      onPageSizeChange={(pageSize: number) =>
        onPageSizeChange(pageSize, isLoggedIn)
      }
      onResizeColumn={onResizeColumn}
    />
  );
}
