/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import {
  RemoteTable,
  updateConfigAndUpsert,
  useBoard,
  ITableConfigSave,
  optimiseFieldMetaForSave,
  ITableDrawerSave,
  PVisualisation,
  updateFieldMetaAttribute,
  TsDataSource,
  useAuth,
  useQueryData,
  LOCAL_API_DATA_PATH,
  fetchActions
} from "..";


export interface PBoardTable extends PVisualisation {
  config: ITableConfigSave;
}

export function BoardTable(props: PBoardTable) {
  const { id, boardDataSource, zone, objectType } = props;

  const { user } = useAuth();
  const { editMode } = useBoard();

  const [config, setConfig] = useState<ITableConfigSave>(props.config);
  const localDataSource = new TsDataSource({
    apiPath: `/api/v1/${LOCAL_API_DATA_PATH}`,
  });

  const actionList = useQueryData<string[]>(
    ["actionsList", id],
    () => fetchActions(user, localDataSource, objectType),
    {
      enabled: !!user,
      staleTime: 0,
    },
  );

  const onConfigSave = ({
    fieldMeta,
    defaultSortByAttribute,
    defaultSortByType
  }: ITableDrawerSave) => {
    config["fieldMeta"] = optimiseFieldMetaForSave(fieldMeta);
    config["defaultSortByAttribute"] = defaultSortByAttribute;
    config["defaultSortByType"] = defaultSortByType;
    setConfig({ ...config });
    updateConfigAndUpsert(
      id,
      config,
      zone,
      boardDataSource
    );
  };

  const onToggleFilterVisibility = (visible: boolean) => {
    config["filterVisibility"] = visible;
    setConfig({ ...config });
    updateConfigAndUpsert(
      id,
      config,
      zone,
      boardDataSource
    );
  };

  const onPageSizeChange = (pageSize: number) => {
    config["pageSize"] = pageSize;
    setConfig({ ...config });
    updateConfigAndUpsert(
      id,
      config,
      zone,
      boardDataSource
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
      boardDataSource
    );
  }

  return (
    <RemoteTable
      {...props}
      noConfigModal={!editMode}
      // RemoteTable defaults to true for resizeableColumns, we want to default to false
      resizeableColumns={editMode || false}
      onResizeColumn={onResizeColumn}
      advanceTab
      editableCells
      displaySource
      fields={config.fieldMeta}
      pageSize={config.pageSize}
      filterVisibility={config.filterVisibility}
      defaultSortByAttribute={config.defaultSortByAttribute}
      defaultSortByType={config.defaultSortByType}
      onConfigSave={onConfigSave}
      onToggleFilterVisibility={onToggleFilterVisibility}
      onPageSizeChange={onPageSizeChange}
      actions={actionList.data}
      // This will change depending on if the user actually has any available actions
      rowSelection={actionList.data && actionList.data.length > 0}
    />
  );
}