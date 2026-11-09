/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { RemoteObjectDetail, RemoteTimeline, PVisualisationComponent, COMPONENT_TYPES, optimiseFieldMetaForSave, updateComponentConfigAndUpsert, useBoard } from "..";
import type { TListDataConfigSave } from "..";


/** Props for the `BoardDataList` component. */
export interface PBoardDataList extends PVisualisationComponent<TListDataConfigSave> {
  /** Which underlying component `BoardDataList` should render. */
  type: typeof COMPONENT_TYPES.OBJECT_DETAIL | typeof COMPONENT_TYPES.TIMELINE;
}

/**
 * BoardDataList is a generic wrapper adapting components that display a data list/record
 * (e.g. RemoteObjectDetail) for use within a Board, switching on `type` to pick the underlying
 * component. Configuration is saved to the board rather than standalone local storage.
 */
export function BoardDataList(props: PBoardDataList) {
  const { id, dataSource, objectType, zone, setZone, config, setConfig, boardDataSource, type } = props;
  const { editMode } = useBoard();

  const onConfigSave = (updatedConfig: TListDataConfigSave) => {
    const nextConfig = {
      ...config,
      ...updatedConfig,
      fieldMeta: optimiseFieldMetaForSave(updatedConfig.fieldMeta ?? config?.fieldMeta),
    };
    setConfig(nextConfig);
    updateComponentConfigAndUpsert(id, nextConfig, zone, boardDataSource, editMode);
  };

  const { fieldMeta, defaultPageSize, defaultSortByAttribute, defaultSortByType, ...additionalOptions } = config;
  const fields = fieldMeta ?? { order: { active: [] } };

  let Component: JSX.ElementType = RemoteObjectDetail;

  switch (type) {
    case COMPONENT_TYPES.OBJECT_DETAIL:
      Component = RemoteObjectDetail;
      break;
    case COMPONENT_TYPES.TIMELINE:
      Component = RemoteTimeline;
      break;
  }

  return (
    <Component
      {...additionalOptions}
      id={id}
      dataSource={dataSource}
      objectType={objectType}
      zone={zone}
      setZone={setZone}
      fields={fields}
      defaultPageSize={defaultPageSize}
      defaultSortByAttribute={defaultSortByAttribute}
      defaultSortByType={defaultSortByType}
      onConfigSave={onConfigSave}
      utilityBarConfig={props.utilityBarConfig}
    />
  );
}