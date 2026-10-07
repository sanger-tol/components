/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { RemoteObjectDetail, PVisualisation, DATA_LIST_COMPONENT_TYPES, updateComponentConfigAndUpsert, useBoard } from "..";
import type { IListDataConfigSave, TDataListComponentType } from "..";

/** Props for the `BoardDataList` component. */
export interface PBoardDataList extends PVisualisation {
  /** Which underlying component `BoardDataList` should render. */
  type: TDataListComponentType;
}

/**
 * BoardDataList is a generic wrapper adapting components that display a data list/record
 * (e.g. RemoteObjectDetail) for use within a Board, switching on `type` to pick the underlying
 * component. Configuration is saved to the board rather than standalone local storage.
 */
export function BoardDataList(props: PBoardDataList) {
  const { id, dataSource, objectType, zone, setZone, config: initialConfig, boardDataSource, type } = props;
  const { editMode } = useBoard();
  const [config, setConfig] = useState<IListDataConfigSave>(initialConfig ?? {});

  useEffect(() => {
    setConfig(initialConfig ?? {});
  }, [initialConfig]);

  const onConfigSave = (updatedConfig: IListDataConfigSave) => {
    const nextConfig = { ...config, ...updatedConfig };
    setConfig(nextConfig);
    updateComponentConfigAndUpsert(id, nextConfig, zone, boardDataSource, editMode);
  };

  const fields = config?.fieldMeta ?? { order: { active: [] } };

  let Component: JSX.ElementType = RemoteObjectDetail;

  switch (type) {
    case DATA_LIST_COMPONENT_TYPES.OBJECT_DETAIL:
      Component = RemoteObjectDetail;
  }

  return (
    <Component
      id={id}
      dataSource={dataSource}
      objectType={objectType}
      zone={zone}
      setZone={setZone}
      fields={fields}
      pageSize={config.pageSize}
      defaultSortByAttribute={config.defaultSortByAttribute}
      defaultSortByType={config.defaultSortByType}
      onConfigSave={onConfigSave}
      utilityBarConfig={props.utilityBarConfig}
    />
  );
}

