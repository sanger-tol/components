/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { RemoteObjectDetail, PVisualisation, DATA_LIST_COMPONENT_TYPES } from "..";
import type { TDataListComponentType } from "..";

/** Props for the `BoardDataList` component. */
export interface PBoardDataList extends PVisualisation {
  /** Which underlying component `BoardDataList` should render. */
  type: TDataListComponentType;
}

/**
 * BoardDataList is a generic wrapper adapting components that display a data list/record
 * (e.g. RemoteObjectDetail) for use within a Board, switching on `type` to pick the underlying
 * component. Kept simple for now: no config-diff management, but does support editing which
 * fields are displayed via `ListDataConfigDrawer`.
 */
export function BoardDataList(props: PBoardDataList) {
  const { id, dataSource, objectType, zone, setZone, config, type } = props;

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
      utilityBarConfig={props.utilityBarConfig}
    />
  );
}

