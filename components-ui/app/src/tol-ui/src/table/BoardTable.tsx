/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { FieldMeta, initialiseFieldMeta } from "./Field";
import { BoardFilters, RemoteTable } from "../index";
import { useState } from "react";
import { upsertComponentConfig, saveTitle } from "../boards/utils";
import { IBoardTargetAndZone } from "../models";

interface Props extends IBoardTargetAndZone{
  id: string;
  title: string;
  config: any;
}

export function BoardTable(props: Props) {
  const { id, title, boardObjectType, boardDataSource } = props;
  const [config, setConfig] = useState<any>(props.config);
  const [forceUpdate, setForceUpdate] = useState(true);
  const [openFilters, setOpenFilters] = useState(false);

  const onModalSave = (fm: FieldMeta) => {
    config["fieldMeta"] = fm;
    setForceUpdate(!forceUpdate); // fetches new data on save
    setConfig({ ...config });
    upsertComponentConfig(boardDataSource, id, config);
  };

  const onToggleFilterVisibility = (visible: boolean) => {
    config["filterVisibility"] = visible;
    setConfig({ ...config });
    upsertComponentConfig(boardDataSource, id, config);
  };

  const onPageSizeChange = (pageSize: boolean) => {
    config["pageSize"] = pageSize;
    setConfig({ ...config });
    upsertComponentConfig(boardDataSource, id, config);
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
      displaySource
      fieldMeta={config.fieldMeta || initialiseFieldMeta()}
      pageSize={config.pageSize || 50}
      filterVisibility={config.filterVisibility ?? true}
      defaultSort={config?.fieldMeta?.order?.active[0] || undefined}
      onModalSave={onModalSave}
      onToggleFilterVisibility={onToggleFilterVisibility}
      onPageSizeChange={onPageSizeChange}
      forceUpdate={forceUpdate}
      utilityBarConfig={{
        title: {
          title: title,
          editable: true,
          onSave: (value: string) => {
            saveTitle(value, boardDataSource, id, boardObjectType);
          }
        },
        elements: boardFilter,
        buttons: [{
          outline: true,
          position: "right",
          type: "primary",
          onClick: () => setOpenFilters(true),
          icon: "filter",
        }],
      }}
    />
  );
}
