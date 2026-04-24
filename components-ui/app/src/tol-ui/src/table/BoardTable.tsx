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
  IConfigDifferences,
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
      user?.id ?? "anon",
      String(editMode),
      String(isLoggedIn),
      String(reset),
    ],
    () =>
      getInitialDiffState(
        boardDataSource,
        id,
        user?.id ?? "",
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
    setTableConfigLocalStorage(`${BOARDS.BOARD_DIFF}_${id}`, "filterVisibility", visible);
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

  const resetDiffState = () => {
    setHasDiff(false);
    setReset((prev: boolean) => !prev);
    setResetKey((k) => k + 1);
  };

  const onReset = async () => {
    console.log("resetting", isLoggedIn, hasDiff);
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
      displaySource
      fields={config.fieldMeta}
      pageSize={config.pageSize}
      filterVisibility={config.filterVisibility}
      defaultSortByAttribute={config.defaultSortByAttribute}
      defaultSortByType={config.defaultSortByType}
      onConfigSave={(config) => onConfigSave({ ...config }, isLoggedIn)}
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
