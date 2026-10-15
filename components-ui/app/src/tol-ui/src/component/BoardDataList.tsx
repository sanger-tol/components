/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { RemoteObjectDetail, RemoteTimeline, PVisualisationComponent, DATA_LIST_COMPONENT_TYPES, optimiseFieldMetaForSave, updateComponentConfigAndUpsert, useBoard } from "..";
import type { IListDataConfigSave, TDataListComponentType } from "..";


/** Props for the `BoardDataList` component. */
export interface PBoardDataList extends PVisualisationComponent<IListDataConfigSave> {
  /** Which underlying component `BoardDataList` should render. */
  type: TDataListComponentType;
}

/**
 * BoardDataList is a generic wrapper adapting components that display a data list/record
 * (e.g. RemoteObjectDetail) for use within a Board, switching on `type` to pick the underlying
 * component. Configuration is saved to the board rather than standalone local storage.
 */
export function BoardDataList(props: PBoardDataList) {
  const { id, dataSource, objectType, zone, setZone, config, setConfig, boardDataSource, type } = props;
  const { editMode } = useBoard();

  const onConfigSave = (updatedConfig: IListDataConfigSave) => {
    const nextConfig = {
      ...config,
      ...updatedConfig,
      fieldMeta: optimiseFieldMetaForSave(updatedConfig.fieldMeta ?? config?.fieldMeta),
    };
    setConfig(nextConfig);
    updateComponentConfigAndUpsert(id, nextConfig, zone, boardDataSource, editMode);
  };

  const fields = config?.fieldMeta ?? { order: { active: [] } };

  let Component: JSX.ElementType = RemoteObjectDetail;

  switch (type) {
    case DATA_LIST_COMPONENT_TYPES.OBJECT_DETAIL:
      Component = RemoteObjectDetail;
      break;
    case DATA_LIST_COMPONENT_TYPES.TIMELINE:
      Component = RemoteTimeline;
      break;
  }

  return (
    <Component
      id={id}
      dataSource={dataSource}
      objectType={objectType}
      zone={zone}
      setZone={setZone}
      fields={fields}
      defaultPageSize={config.defaultPageSize}
      defaultSortByAttribute={config.defaultSortByAttribute}
      defaultSortByType={config.defaultSortByType}
      onConfigSave={onConfigSave}
      utilityBarConfig={props.utilityBarConfig}
    />
  );
}