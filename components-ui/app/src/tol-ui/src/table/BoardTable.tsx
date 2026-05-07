/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect, useRef } from "react";
import {
  RemoteTable,
  updateComponentConfigAndUpsert,
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
  fetchActions,
  ANONYMOUS_USER_QUERY_KEY,
} from "..";
import type {
  ITableConfigSave,
  ITableDrawerSave,
  PVisualisation,
  IDiffState,
  IConfigDifferences,
} from "..";

export interface PBoardTable extends PVisualisation {
  config: ITableConfigSave;
}

export function BoardTable(props: PBoardTable) {
  const { id, boardDataSource, zone, objectType, actionsDataSource } = props;

  const { user } = useAuth();
  const { editMode } = useBoard();

  const isLoggedIn: boolean = !!user?.id;

  const componentData = zone?.children[0]?.[id];

  const sourceConfig = editMode
    ? componentData?.config
    : componentData?.config_diff?.config || componentData?.config;

  const [config, setConfig] = useState<ITableConfigSave>(
    structuredClone(sourceConfig),
  );

  // useEffect(() => {
  //   console.log(
  //     `edit mode is: ${editMode} & current component config:`,
  //     config,
  //   );
  //   console.log(`current component config:`, componentData?.config);
  // }, [config]);

  const actionList = useQueryData<string[]>(
    ["actionsList", id],
    () => fetchActions(user, actionsDataSource, objectType),
    {
      enabled: !!user,
      staleTime: 0,
    },
  );

  // Trigger a re-render of of the RemoteTable
  const [resetKey, setResetKey] = useState<number>(0);

  // Trigger a new fetch query for the diff state
  const [reset, setReset] = useState<boolean>(false);
  const [hasDiff, setHasDiff] = useState<boolean>(
    !!componentData?.config_diff?.config,
  );
  const [configDifferences, setConfigDifferences] =
    useState<IConfigDifferences>({
      add: [],
      remove: [],
    });

  const initialisedRef = useRef(false);

  // If the diffState changes (e.g. user logs in and there is a diff, or user logs out),
  // update the config and hasDiff state accordingly

  useEffect(() => {
    editMode
      ? setConfig({ ...componentData?.config })
      : setConfig({
          ...(componentData?.config_diff?.config || componentData?.config),
        });
    if (initialisedRef.current) setResetKey((k) => k + 1);
    initialisedRef.current = true;
  }, [editMode]);

  // ── Handlers: persist changes ────────────────────────────────────────────

  const onConfigSave = (
    { fieldMeta, defaultSortByAttribute, defaultSortByType }: ITableDrawerSave,
    isLoggedIn: boolean,
  ) => {
    const newFieldMeta = optimiseFieldMetaForSave(fieldMeta);
    const nextConfig = {
      ...config,
      defaultSortByAttribute,
      defaultSortByType,
      fieldMeta: newFieldMeta,
    };
    setConfig(nextConfig);
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
      `${BOARDS.BOARD_DIFF}_${id}`,
      ["fieldMeta", "defaultSortByAttribute", "defaultSortByType"],
      [newFieldMeta, defaultSortByAttribute, defaultSortByType],
    );
    setHasDiff(true);
  };

  const onFilterVisibilityChange = (visible: boolean, isLoggedIn: boolean) => {
    config["filterVisibility"] = visible;
    setConfig({ ...config });
    updateComponentConfigAndUpsert(
      id,
      config,
      zone,
      boardDataSource,
      editMode,
      setHasDiff,
      user?.id,
    );
  };

  const onResizeColumn = (columnWidth: number, dataKey: string) => {
    updateFieldMetaAttribute(
      config["fieldMeta"]!,
      dataKey,
      "width",
      columnWidth,
    );
    setConfig({ ...config });
    updateComponentConfigAndUpsert(
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
      updateComponentConfigAndUpsert(
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

  const resetDiffState = () => {
    setHasDiff(false);
    setReset((prev: boolean) => !prev);
    setResetKey((k) => k + 1);
  };

  const onReset = async () => {
    isLoggedIn && hasDiff
      ? await deleteComponentDiff(id, boardDataSource, user?.id ?? "").then(
          () => {
            resetDiffState();
          },
        )
      : hasDiff
        ? (clearTableConfigLocalStorage(`${BOARDS.BOARD_DIFF}_${id}`),
          resetDiffState())
        : null;
  };

  return (
    <RemoteTable
      key={resetKey}
      {...props}
      resizeableColumns={editMode || false}
      onReset={onReset}
      showConfigReset={hasDiff}
      resetConfigDifferences={configDifferences}
      advanceTab
      editableCells
      displaySource
      fields={config.fieldMeta}
      pageSize={config.pageSize}
      filterVisibility={config.filterVisibility}
      defaultSortByAttribute={config.defaultSortByAttribute}
      defaultSortByType={config.defaultSortByType}
      actions={actionList.data}
      actionDataSource={actionsDataSource}
      rowSelection={actionList.data && actionList.data.length > 0}
      onConfigSave={(config) => onConfigSave({ ...config }, isLoggedIn)}
      onToggleFilterVisibility={(visible: boolean) =>
        onFilterVisibilityChange(visible, isLoggedIn)
      }
      onPageSizeChange={(pageSize: number) =>
        onPageSizeChange(pageSize, isLoggedIn)
      }
      onResizeColumn={onResizeColumn}
    />
  );
}
