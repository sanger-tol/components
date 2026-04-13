/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import {
  RemoteTable,
  updateConfigAndUpsert,
  deleteComponentDiff,
  useBoard,
  ITableConfigSave,
  optimiseFieldMetaForSave,
  ITableDrawerSave,
  PVisualisation,
  updateFieldMetaAttribute,
} from "..";


export interface PBoardTable extends PVisualisation {
  config: ITableConfigSave;
}

export function BoardTable(props: PBoardTable) {
  const { id, boardDataSource, zone } = props;

  const { editMode } = useBoard();


  const [config, setConfig] = useState<ITableConfigSave>(props.config);
  const [resetKey, setResetKey] = useState(0);

  const onConfigSave = ({
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
    updateConfigAndUpsert(
      id,
      config,
      zone,
      boardDataSource,
      editMode
    );
  };

  const onToggleFilterVisibility = (visible: boolean) => {
    config["filterVisibility"] = visible;
    setConfig({ ...config });
    updateConfigAndUpsert(
      id,
      config,
      zone,
      boardDataSource,
      editMode
    );
  };

  const onPageSizeChange = (pageSize: number) => {
    config["pageSize"] = pageSize;
    setConfig({ ...config });
    updateConfigAndUpsert(
      id,
      config,
      zone,
      boardDataSource,
      editMode
    );
  };

  const onResizeColumn = (
    columnWidth: number,
    dataKey: string,
  ) => {
    updateFieldMetaAttribute(
      config["fieldMeta"]!,
      dataKey,
      "width",
      columnWidth
    );
    setConfig({ ...config });
    updateConfigAndUpsert(
      id,
      config,
      zone,
      boardDataSource,
      editMode
    );
  };

  const onReset = async () => {
    if (!editMode) {
      await deleteComponentDiff(id, boardDataSource);
    }
    // Fetch the original component config directly from the server (bypasses any diff)
    const originalComponents = await boardDataSource.getList({
      objectType: "component",
      filter: { and_: { id: { eq: { value: id } } } },
      requestedFields: ["config"],
    });
    const originalConfig = originalComponents?.[0]?.config ?? props.config;
    zone.components[id].data.config = originalConfig;
    setConfig({ ...originalConfig });
    setResetKey((k) => k + 1);
  };

  return (
    <RemoteTable
      key={resetKey}
      {...props}
      // RemoteTable defaults to true for resizeableColumns, we want to default to false
      resizeableColumns={editMode || false}
      onResizeColumn={onResizeColumn}
      onReset={onReset}
      advanceTab
      displaySource
      fields={config.fieldMeta}
      pageSize={config.pageSize}
      filterVisibility={config.filterVisibility}
      defaultSortByAttribute={config.defaultSortByAttribute}
      defaultSortByType={config.defaultSortByType}
      onConfigSave={onConfigSave}
      onToggleFilterVisibility={onToggleFilterVisibility}
      onPageSizeChange={onPageSizeChange}
      // disabled temporarily
      // actions={config.actions}
      rowSelection={Array.isArray(config.actions) && config.actions.length > 0}
    />
  );
}