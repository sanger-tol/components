/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import {
  FieldMeta,
  initialiseFieldMeta,
  BoardFilters,
  RemoteTable,
  saveTitle,
  IBoardTargetAndZone,
  updateConfigAndUpsert,
  useBoardPrivilege,
  PRIVILEGE,
  ITableConfigSave,
  optimiseFieldMetaForSave,
} from "..";


export interface PBoardTable extends IBoardTargetAndZone {
  id: string;
  title: string;
  config: ITableConfigSave;
}

export function BoardTable(props: PBoardTable) {
  const { id, title, boardObjectType, boardDataSource, zone } = props;
  const [config, setConfig] = useState<ITableConfigSave>(props.config);
  const [openFilters, setOpenFilters] = useState(false);
  const { privilege } = useBoardPrivilege()

  const onConfigSave = ({
    fieldMeta: fm,
    actions,
    defaultSortByAttribute,
    defaultSortByType
  }: ITableConfigSave) => {
    config["fieldMeta"] = optimiseFieldMetaForSave(fm);
    config["actions"] = actions;
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

  const boardFilter = [
    <span key="board-table-filter">
      <BoardFilters
        {...props}
        open={openFilters}
        setOpen={setOpenFilters}
      />
    </span>,
  ];

  return (
    <RemoteTable
      {...props}
      noConfigModal={privilege !== PRIVILEGE.BOARD.EDITABLE}
      displaySource
      fields={initialiseFieldMeta(config.fieldMeta)}
      pageSize={config.pageSize}
      filterVisibility={config.filterVisibility}
      defaultSortByAttribute={config.defaultSortByAttribute}
      defaultSortByType={config.defaultSortByType}
      onConfigSave={onConfigSave}
      onToggleFilterVisibility={onToggleFilterVisibility}
      onPageSizeChange={onPageSizeChange}
      // actions={config.actions}
      rowSelection={Array.isArray(config.actions) && config.actions.length > 0}
      utilityBarConfig={{
        title: {
          text: title,
          editable: privilege === PRIVILEGE.BOARD.EDITABLE,
          onSave: (value: string) => {
            saveTitle(value, id, boardObjectType, boardDataSource);
          }
        },
        elements: boardFilter,
        buttons: [privilege !== PRIVILEGE.BOARD.EDITABLE ? undefined : {
          outline: true,
          position: "right",
          type: "primary",
          tooltip: "Open filter config",
          onClick: () => setOpenFilters(true),
          icon: "filter",
        }],
      }}
    />
  );
}
