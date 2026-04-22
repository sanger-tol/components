/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect, useRef } from "react";
import {
  RemoteTable,
  updateConfigAndUpsert,
  deleteComponentDiff,
  useBoard,
  optimiseFieldMetaForSave,
  updateFieldMetaAttribute,
  useAuth,
  BOARDS,
  setTableConfigLocalStorage,
  clearTableConfigLocalStorage,
  useQueryData,
  getInitialDiffState,
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
  const { id, boardDataSource, zone } = props;

  const { editMode } = useBoard();
  const { user } = useAuth();

  const isLoggedIn: boolean = !!user?.id;

  const [config, setConfig] = useState<ITableConfigSave>(props.config);
  const [resetKey, setResetKey] = useState<number>(0);
  const [hasDiff, setHasDiff] = useState<boolean>(false);
  const [publishedColumnCount, setPublishedColumnCount] = useState<number>(
    props.config.fieldMeta?.order?.active?.length ?? 0,
  );

  const updatePublishedColumnCount = (publishedConfig?: ITableConfigSave) => {
    setPublishedColumnCount(
      publishedConfig?.fieldMeta?.order?.active?.length ?? 0,
    );
  };

  const initialisedRef = useRef(false);

  const { data: diffState } = useQueryData<IDiffState>(
    [BOARDS.BOARD_DIFF, id, user?.id ?? "anon", String(editMode)],
    () =>
      getInitialDiffState(
        boardDataSource,
        id,
        user?.id ?? "",
        isLoggedIn,
        editMode,
      ),
    { enabled: true },
  );

  useEffect(() => {
    if (!diffState) return;
    setPublishedColumnCount(diffState.publishedColumnCount);
    setConfig({ ...diffState.currentConfig });
    setHasDiff(diffState.hasDiff);
    if (initialisedRef.current) setResetKey((k) => k + 1);
    initialisedRef.current = true;
  }, [diffState]);

  // ── Logged-in handlers: persist exclusively to board_diff ────────────────

  const onConfigSaveLoggedIn = (
    {
      fieldMeta,
      actions,
      defaultSortByAttribute,
      defaultSortByType,
    }: ITableDrawerSave,
    isLoggedIn: boolean,
  ) => {
    config["fieldMeta"] = optimiseFieldMetaForSave(fieldMeta);
    config["actions"] = actions;
    config["defaultSortByAttribute"] = defaultSortByAttribute;
    config["defaultSortByType"] = defaultSortByType;
    setConfig({ ...config });
    if (isLoggedIn) {
      updateConfigAndUpsert(
        id,
        config,
        zone,
        boardDataSource,
        editMode,
        setHasDiff,
        user?.id,
      );
      return;
    }
    setTableConfigLocalStorage(
      `${BOARDS.BOARD_DIFF}_${id}`,
      ["fieldMeta", "defaultSortByAttribute", "defaultSortByType"],
      [config["fieldMeta"], defaultSortByAttribute, defaultSortByType],
    );
    setHasDiff(true);
  };

  const onFilterVisibilityChange = (visible: boolean, isLoggedIn: boolean) => {
    config["filterVisibility"] = visible;
    setConfig({ ...config });
    if (isLoggedIn) {
      updateConfigAndUpsert(
        id,
        config,
        zone,
        boardDataSource,
        editMode,
        setHasDiff,
        user?.id,
      );
      return;
    }
    setTableConfigLocalStorage(`board_diff_${id}`, "filterVisibility", visible);
    setHasDiff(true);
  };

  const onResizeColumn = (columnWidth: number, dataKey: string) => {
    updateFieldMetaAttribute(
      config["fieldMeta"]!,
      dataKey,
      "width",
      columnWidth,
    );
    setConfig({ ...config });
    updateConfigAndUpsert(
      id,
      config,
      zone,
      boardDataSource,
      editMode,
      setHasDiff,
      user?.id,
    );
  };

  const onPageSizeChange = (pageSize: number, isLoggedIn: boolean) => {
    config["pageSize"] = pageSize;
    setConfig({ ...config });
    if (isLoggedIn) {
      updateConfigAndUpsert(
        id,
        config,
        zone,
        boardDataSource,
        editMode,
        setHasDiff,
        user?.id,
      );
      return;
    }
    setTableConfigLocalStorage(
      `${BOARDS.BOARD_DIFF}_${id}`,
      "pageSize",
      pageSize,
    );
    setHasDiff(true);
  };

  // ── Reset ────────────────────────────────────────────────────────────────

  const onReset = async () => {
    if (isLoggedIn) {
      if (!editMode) {
        await deleteComponentDiff(id, boardDataSource, user?.id);
      }
      // Fetch the original config from the server (bypasses any diff)
      const originalComponents = await boardDataSource.getList({
        objectType: "component",
        filter: { and_: { id: { eq: { value: id } } } },
        requestedFields: ["config"],
      });
      const originalConfig = originalComponents?.[0]?.config ?? props.config;
      zone.components[id].data.config = originalConfig;
      updatePublishedColumnCount(originalConfig);
      setConfig({ ...originalConfig });
    } else {
      clearTableConfigLocalStorage(`board_diff_${id}`);
      const originalComponents = await boardDataSource.getList({
        objectType: "component",
        filter: { and_: { id: { eq: { value: id } } } },
        requestedFields: ["config"],
      });
      const originalConfig = originalComponents?.[0]?.config ?? props.config;
      zone.components[id].data.config = originalConfig;
      updatePublishedColumnCount(originalConfig);
      setConfig({ ...originalConfig });
    }
    setResetKey((k) => k + 1);
    setHasDiff(false);
  };

  return (
    <RemoteTable
      key={resetKey}
      {...props}
      // RemoteTable defaults to true for resizeableColumns, we want to default to false.
      // Non-logged in users cannot resize columns, as they don't have access to 'Edit Mode'.
      // We can possibly change this in the future.
      resizeableColumns={editMode || false}
      onReset={onReset}
      showConfigReset={hasDiff}
      resetConfigColumnCount={publishedColumnCount}
      advanceTab
      displaySource
      fields={config.fieldMeta}
      pageSize={config.pageSize}
      filterVisibility={config.filterVisibility}
      defaultSortByAttribute={config.defaultSortByAttribute}
      defaultSortByType={config.defaultSortByType}
      onConfigSave={(config) => onConfigSaveLoggedIn({ ...config }, isLoggedIn)}
      onToggleFilterVisibility={(visible: boolean) =>
        onFilterVisibilityChange(visible, isLoggedIn)
      }
      onPageSizeChange={(pageSize: number) =>
        onPageSizeChange(pageSize, isLoggedIn)
      }
      onResizeColumn={onResizeColumn}
      rowSelection={Array.isArray(config.actions) && config.actions.length > 0}
    />
  );
}
