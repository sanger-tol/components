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
  TDataObjectListOrNull,
  useAuth,
  PopUpMessage,
  getRoleIdsByNames,
  useQueryData,
  LOCAL_API_DATA_PATH,
} from "..";


export interface PBoardTable extends PVisualisation {
  config: ITableConfigSave;
}

export function BoardTable(props: PBoardTable) {
  const { id, boardDataSource, zone, objectType } = props;

  const { user } = useAuth();
  const { editMode } = useBoard();

  const [config, setConfig] = useState<ITableConfigSave>(props.config);
  const [actionList, setActionList] = useState<string[] | undefined>(undefined);
  const localDataSource = new TsDataSource({
    apiPath: `/api/v1/${LOCAL_API_DATA_PATH}`,
  });

  const fetchActions = async (): Promise<string[]> => {
    if (!user) return [];
    const roleids = await getRoleIdsByNames(user.roles, localDataSource);
    return localDataSource.getListPage({
      objectType: "role_action",
      filter: {
        "and_": {
          "role_id": {
            "in_list": {
              "value": roleids
            },
          },
        }
      }
    }).then(async (res: TDataObjectListOrNull) => {
      const data = await Promise.all(res?.map(async (item: any) => {
        const action = await item.fetchRelationships.action;
        return action;
      }) || []);
      if (data.length === 0) {
        setActionList([]);
        return [];
      }
      const actionNames: string[] = []
      for (const action of data) {
        if (action.object_type == objectType) {
          actionNames.push(action.name);
        }
      }
      setActionList(actionNames);
      return actionNames;
    }).catch((error: any) => {
      PopUpMessage({
        type: "error",
        message: `Error Fetching Actions: ${error}`,
      });
      return [];
    })
  }

  useQueryData<string[]>(
    ["actionsList", id],
    fetchActions,
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
      actions={actionList}
      // This will change depending on if the user actually has any available actions
      rowSelection={actionList && actionList.length > 0}
    />
  );
}