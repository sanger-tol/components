/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { FieldMeta, initialiseFieldMeta } from "./Field";
import { BoardFilters, RemoteTable, TsDataSource } from "../index";
import { useState } from "react";
import { upsertComponentConfig, IZone, saveTitle } from "../boards/utils";

interface Props {
  id: string;
  objectType: string;
  baseUrl?: string;
  title: string;
  config: any;
  zone: IZone;
  setZone: any;
}

function BoardTable(props: Props) {
  const { id, objectType } = props;
  const ds = new TsDataSource();
  const [config, setConfig] = useState<any>(props.config);
  const [forceUpdate, setForceUpdate] = useState(true);
  const [openFilters, setOpenFilters] = useState(false);

  const onModalSave = (fm: FieldMeta, actions: string[]) => {
    config["fieldMeta"] = fm;
    config["actions"] = actions;
    setForceUpdate(!forceUpdate); // fetches new data on save
    setConfig({ ...config });
    upsertComponentConfig(ds, id, config);
  };

  const onToggleFilterVisibility = (visible: boolean) => {
    config["filterVisibility"] = visible;
    setConfig({ ...config });
    upsertComponentConfig(ds, id, config);
  };

  const onPageSizeChange = (pageSize: boolean) => {
    config["pageSize"] = pageSize;
    setConfig({ ...config });
    upsertComponentConfig(ds, id, config);
  };

  const boardFilter = [
    <span key="board-table-filter">
      <BoardFilters
        endpoint={objectType}
        entityType="component"
        open={openFilters}
        setOpen={setOpenFilters}
        {...props}
      />
    </span>,
  ];

  return (
    <RemoteTable
      displaySource
      endpoint={objectType}
      fieldMeta={config.fieldMeta || initialiseFieldMeta()}
      pageSize={config.pageSize || 50}
      filterVisibility={config.filterVisibility ?? true}
      defaultSort={config?.fieldMeta?.order?.active[0] || undefined}
      onModalSave={onModalSave}
      onToggleFilterVisibility={onToggleFilterVisibility}
      onPageSizeChange={onPageSizeChange}
      forceUpdate={forceUpdate}
      // actions={config.actions}
      rowSelection={config.actions?.length > 0}
      utilityBarConfig={{
        title: {
          title: props.title,
          editable: true,
          onSave: (value: string) => {
            saveTitle(value, ds, id, "component");
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
      {...props}
    />
  );
}

export default BoardTable;
