/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import {
  RemoteTable,
  updateConfigAndUpsert,
  deleteComponentDiff,
  useBoard,
  optimiseFieldMetaForSave,
  updateFieldMetaAttribute,
  useAuth,
  BOARDS,
  getTableConfigLocalStorage,
  setTableConfigLocalStorage,
  clearTableConfigLocalStorage,
  useEffectUpdate,
} from "..";
import type {
  ITableConfigSave,
  ITableDrawerSave,
  PVisualisation,
  TDataObjectListOrNull,
} from "..";


export interface PBoardTable extends PVisualisation {
  config: ITableConfigSave;
}

export function BoardTable(props: PBoardTable) {
  const { id, boardDataSource, zone } = props;

  const { editMode } = useBoard();
  const { user } = useAuth();

  const isLoggedIn = !!user?.id;

  const [config, setConfig] = useState<ITableConfigSave>(props.config);
  const [resetKey, setResetKey] = useState<number>(0);
  const [hasDiff, setHasDiff] = useState<boolean>(false);
  const [publishedColumnCount, setPublishedColumnCount] = useState<number>(
    props.config.fieldMeta?.order?.active?.length ?? 0
  );

  const updatePublishedColumnCount = (publishedConfig?: ITableConfigSave) => {
    setPublishedColumnCount(
      publishedConfig?.fieldMeta?.order?.active?.length ?? 0
    );
  };

  useEffect(() => {
    boardDataSource
      .getList({
        objectType: BOARDS.COMPONENT,
        filter: { and_: { id: { eq: { value: id } } } },
        requestedFields: ["config"],
      })
      .then((components: TDataObjectListOrNull) => {
        updatePublishedColumnCount(components?.[0]?.config);
      })
      .catch(() => {});

    if (isLoggedIn) {
      boardDataSource
        .getList({
          objectType: BOARDS.BOARD_DIFF,
          filter: {
            and_: {
              component_id: { eq: { value: id } },
              user_id: { eq: { value: user.id } },
            },
          },
          requestedFields: ["id", "config"],
        })
        .then((diffs: TDataObjectListOrNull) => {
          setHasDiff(diffs?.some((d: any) => d?.config != null) ?? false);
        })
        .catch(() => setHasDiff(false));
    } else {
      setHasDiff(!!getTableConfigLocalStorage(`board_diff_${id}`));
    }
  }, []);

  // ── Sync config when editMode changes (logged-in users only) ─────────────
  // Edit mode: show original base config so edits target the component directly.
  // View mode: re-apply the user's board_diff overlay on top of the base config.
  useEffectUpdate(() => {
    if (!isLoggedIn) {
      if (hasDiff){
        getTableConfigLocalStorage(`board_diff_${id}`)
      }
      return;
    }

    if (editMode) {
      // Entering edit mode – fetch base component config (no diff applied)
      boardDataSource
        .getList({
          objectType: BOARDS.COMPONENT,
          filter: { and_: { id: { eq: { value: id } } } },
          requestedFields: ["config"],
        })
        .then((res: TDataObjectListOrNull) => {
          const originalConfig = res?.[0]?.config;
          if (originalConfig) {
            zone.components[id].data.config = originalConfig;
            updatePublishedColumnCount(originalConfig);
            setConfig({ ...originalConfig });
            setResetKey((k) => k + 1);
          }
        })
        .catch(() => {});
    } else {
      // Exiting edit mode – re-fetch base config and re-apply diff if present
      Promise.all([
        boardDataSource.getList({
          objectType: BOARDS.COMPONENT,
          filter: { and_: { id: { eq: { value: id } } } },
          requestedFields: ["config"],
        }),
        boardDataSource.getList({
          objectType: BOARDS.BOARD_DIFF,
          filter: {
            and_: {
              component_id: { eq: { value: id } },
              user_id: { eq: { value: user.id } },
            },
          },
          requestedFields: ["config"],
        }),
      ])
        .then(([components, diffs]: [TDataObjectListOrNull, TDataObjectListOrNull]) => {
          const baseConfig = components?.[0]?.config;
          const diffConfig = diffs?.find((d: any) => d?.config != null)?.config;
          const effectiveConfig = diffConfig ?? baseConfig;
          updatePublishedColumnCount(baseConfig);
          if (effectiveConfig) {
            zone.components[id].data.config = effectiveConfig;
            setConfig({ ...effectiveConfig });
            setResetKey((k) => k + 1);
          }
        })
        .catch(() => {});
    }
  }, [editMode, hasDiff, isLoggedIn]);


  // ── Logged-in handlers: persist exclusively to board_diff ────────────────

  const onConfigSaveLoggedIn = ({
    fieldMeta,
    actions,
    defaultSortByAttribute,
    defaultSortByType,
  }: ITableDrawerSave) => {
    config["fieldMeta"] = optimiseFieldMetaForSave(fieldMeta);
    config["actions"] = actions;
    config["defaultSortByAttribute"] = defaultSortByAttribute;
    config["defaultSortByType"] = defaultSortByType;
    setConfig({ ...config });
    updateConfigAndUpsert(id, config, zone, boardDataSource, editMode, setHasDiff, user?.id);
  };

  const onToggleFilterVisibilityLoggedIn = (visible: boolean) => {
    config["filterVisibility"] = visible;
    setConfig({ ...config });
    updateConfigAndUpsert(id, config, zone, boardDataSource, editMode, setHasDiff, user?.id);
  };

  const onPageSizeChangeLoggedIn = (pageSize: number) => {
    config["pageSize"] = pageSize;
    setConfig({ ...config });
    updateConfigAndUpsert(id, config, zone, boardDataSource, editMode, setHasDiff, user?.id);
  };

  const onResizeColumnLoggedIn = (columnWidth: number, dataKey: string) => {
    updateFieldMetaAttribute(config["fieldMeta"]!, dataKey, "width", columnWidth);
    setConfig({ ...config });
    updateConfigAndUpsert(id, config, zone, boardDataSource, editMode, setHasDiff, user?.id);
  };

  // ── Not-logged-in handlers: persist exclusively to localStorage ──────────

  const onConfigSaveAnon = ({
    fieldMeta,
    actions,
    defaultSortByAttribute,
    defaultSortByType,
  }: ITableDrawerSave) => {
    const meta = optimiseFieldMetaForSave(fieldMeta);
    config["fieldMeta"] = meta;
    config["actions"] = actions;
    config["defaultSortByAttribute"] = defaultSortByAttribute;
    config["defaultSortByType"] = defaultSortByType;
    setConfig({ ...config });
    setTableConfigLocalStorage(`board_diff_${id}`, "fieldMeta", meta);
    if (defaultSortByAttribute !== undefined)
      setTableConfigLocalStorage(`board_diff_${id}`, "defaultSortByAttribute", defaultSortByAttribute);
    if (defaultSortByType !== undefined)
      setTableConfigLocalStorage(`board_diff_${id}`, "defaultSortByType", defaultSortByType);
    setHasDiff(true);
  };

  const onToggleFilterVisibilityAnon = (visible: boolean) => {
    config["filterVisibility"] = visible;
    setConfig({ ...config });
    setTableConfigLocalStorage(`board_diff_${id}`, "filterVisibility", visible);
    setHasDiff(true);
  };

  const onPageSizeChangeAnon = (pageSize: number) => {
    config["pageSize"] = pageSize;
    setConfig({ ...config });
    setTableConfigLocalStorage(`board_diff_${id}`, "pageSize", pageSize);
    setHasDiff(true);
  };

  const onResizeColumnAnon = (columnWidth: number, dataKey: string) => {
    updateFieldMetaAttribute(config["fieldMeta"]!, dataKey, "width", columnWidth);
    setConfig({ ...config });
    setTableConfigLocalStorage(`board_diff_${id}`, "fieldMeta", optimiseFieldMetaForSave(config["fieldMeta"]!));
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
      // RemoteTable defaults to true for resizeableColumns, we want to default to false
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
      onConfigSave={isLoggedIn ? onConfigSaveLoggedIn : onConfigSaveAnon}
      onToggleFilterVisibility={isLoggedIn ? onToggleFilterVisibilityLoggedIn : onToggleFilterVisibilityAnon}
      onPageSizeChange={isLoggedIn ? onPageSizeChangeLoggedIn : onPageSizeChangeAnon}
      onResizeColumn={isLoggedIn ? onResizeColumnLoggedIn : onResizeColumnAnon}
      // disabled temporarily
      // actions={config.actions}
      rowSelection={Array.isArray(config.actions) && config.actions.length > 0}
    />
  );
}