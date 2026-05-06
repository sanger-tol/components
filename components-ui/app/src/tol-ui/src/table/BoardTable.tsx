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

  const [config, setConfig] = useState<ITableConfigSave>(props.config);

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
  const [hasDiff, setHasDiff] = useState<boolean>(false);
  const [configDifferences, setConfigDifferences] = useState<IConfigDifferences>({
    add: [],
    remove: [],
  });

  const initialisedRef = useRef(false);

  // ── Fetch diff state ─────────────────────────────────────────────────────

  const { data: diffState } = useQueryData<IDiffState>(
    [
      // This is the key for the query,
      // it will change as state updates, triggering a new function call
      BOARDS.BOARD_DIFF,
      id,
      user?.id ?? ANONYMOUS_USER_QUERY_KEY,
      String(editMode),
      String(isLoggedIn),
      String(reset),
    ],
    () =>
      getInitialDiffState(
        boardDataSource,
        id,
        user?.id ?? ANONYMOUS_USER_QUERY_KEY,
        isLoggedIn,
        props.objectType,
        editMode,
      ),
    { enabled: true },
  );

  // If the diffState changes (e.g. user logs in and there is a diff, or user logs out),
  // update the config and hasDiff state accordingly

  useEffect(() => {
    if (!diffState) return;
    setConfigDifferences(diffState.configDifferences);
    setConfig({ ...diffState.currentConfig });
    setHasDiff(diffState.hasDiff);
    if (initialisedRef.current) setResetKey((k) => k + 1);
    initialisedRef.current = true;
  }, [diffState]);

  // ── Handlers: persist changes ────────────────────────────────────────────

  const onConfigSave = (
    {
      fieldMeta,
        defaultSortByAttribute,
      defaultSortByType,
    }: ITableDrawerSave,
    isLoggedIn: boolean,
  ) => {
    config["fieldMeta"] = optimiseFieldMetaForSave(fieldMeta);
    config["defaultSortByAttribute"] = defaultSortByAttribute;
    config["defaultSortByType"] = defaultSortByType;
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
      ["fieldMeta", "defaultSortByAttribute", "defaultSortByType"],
      [config["fieldMeta"], defaultSortByAttribute, defaultSortByType],
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

  const onPageSizeChange = (pageSize: number) => {
    config["pageSize"] = pageSize;
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
        ? (clearTableConfigLocalStorage(`${BOARDS.BOARD_DIFF}_${id}`), resetDiffState())
        : null;
  };

  return (
    <RemoteTable
      key={resetKey}
      {...props}
      // RemoteTable defaults to true for resizeableColumns, we want to default to false.
      // Non-logged in users cannot resize columns, as they don't have access to 'Edit Mode'.
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
      // This will change depending on if the user actually has any available actions
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
