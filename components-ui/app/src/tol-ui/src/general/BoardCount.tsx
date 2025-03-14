/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from 'react';
import { FieldMeta, initialiseFieldMeta } from "../table/Field";
import { BoardFilters, Button, RemoteTable, TsDataSource, RemoteCount } from "../index";
import { upsertComponentConfig, IZone } from "../boards/utils";

interface Props {
  id: string;
  title: string;
  objectType: string;
  baseUrl?: string;
  zone: IZone;
  setZone: any;
  config: any;
}

function BoardCount(props: Props) {
  const { id, objectType } = props;
  const ds = new TsDataSource();
  const [config, setConfig] = useState<any>(props.config);
  const [forceUpdate, setForceUpdate] = useState(true);
  const [openFilters, setOpenFilters] = useState(false);

  const onModalSave = (fm: FieldMeta) => {
    config["fieldMeta"] = fm;
    setForceUpdate(!forceUpdate); // fetches new data on save
    setConfig({ ...config });
    upsertComponentConfig(ds, id, config);
  };

  const filterButtons = [
    <span key="board-table-filter">
      <Button
        outline
        position="right"
        type="primary"
        onClick={() => setOpenFilters(true)}
        icon="filter"
      />
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
    <div>
      {filterButtons}
      <RemoteCount
        id={id}
        title={props.title}
        endpoint={objectType}
        baseUrl={props.baseUrl}
        zone={props.zone}
        setZone={props.setZone}
      />
    </div>
  );
}

export default BoardCount;
