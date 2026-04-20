/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
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
  API_METHODS,
  useAuth,
  PopUpMessage,
  getRoleIdsByNames
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
    apiPath: "/api/v1/local",
  });


  useEffect(() => {
    const fetchActions = async () => {
      const roleids = await getRoleIdsByNames(user?.roles, localDataSource);
      localDataSource.custom({
        method: API_METHODS.POST,
        resource: `role_action`,
        body: {
          filter: {
            "and_": {
              "role_id": {
                "in_list": {
                  "value": roleids
                },
              },
            }
          }
        }
      }).then((res: any) => {
        if (!res.data.included || res.data.included.length === 0) {
          setActionList([]);
          return;
        }
        const actionNames = res.data.included.map((relatedObj: any) => {
          if (relatedObj.type === "action" && relatedObj.attributes.object_type == objectType) {
            return relatedObj.attributes.name;
          }
        })
        setActionList(actionNames.filter((name: string | undefined): name is string => name !== undefined));

      }).catch((error: any) => {
        PopUpMessage({
          type: "error",
          message: `Error Fetching Actions: ${error}`,
        });
      })
    }
    fetchActions();
  }, [])

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