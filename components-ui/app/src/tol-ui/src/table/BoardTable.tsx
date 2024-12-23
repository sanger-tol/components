/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { FieldMeta, initialiseFieldMeta } from "./Field";
import { RemoteTable, TsDataSource } from "../index";
import { useState } from "react";
import { upsertComponentConfig } from "../boardNew/Utils";


interface Props {
  id: string;
  objectType: string;
  baseUrl?: string;
  title: string;
  config: any;
  zone: object;
  setZone: any;
}

function BoardTable(props: Props) {
  const {
    id,
    objectType,
  } = props;
  const ds = new TsDataSource();
  const [config, setConfig] = useState<any>(props.config);
  const [forceUpdate, setForceUpdate] = useState(true);

  const onModalSave = (fm: FieldMeta) => {
    config['fieldMeta'] = fm;
    setForceUpdate(!forceUpdate) // fetches new data on save
    setConfig({...config});
    upsertComponentConfig(ds, id, config);
  };
  
  const onToggleFilterVisibility = (visible: boolean) => {
    config['filterVisibility'] = visible;
    setConfig({...config});
    upsertComponentConfig(ds, id, config);
  }

  const onPageSizeChange = (pageSize: boolean) => {
    config['pageSize'] = pageSize;
    setConfig({...config});
    upsertComponentConfig(ds, id, config);
  }


  return (
    <RemoteTable
      endpoint={objectType}
      fieldMeta={config.fieldMeta || initialiseFieldMeta()}
      pageSize={config.pageSize || 50}
      filterVisibility={config.filterVisibility ?? true}
      defaultSort={config?.fieldMeta?.order?.active[0] || undefined}
      onModalSave={onModalSave}
      onToggleFilterVisibility={onToggleFilterVisibility}
      onPageSizeChange={onPageSizeChange}
      forceUpdate={forceUpdate}
      {...props}
    />
  );
}

export default BoardTable;
