/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import {
  RemoteObjectDetail,
  ObjectDetailConfigDrawer,
  PVisualisation,
  PButton,
  useBoard,
  mergeUtilityBarConfigs,
  updateComponentConfigAndUpsert,
  DATA_LIST_COMPONENT_TYPES_,
} from "..";
import type { IFieldMeta } from "..";

export type TDataListType = (typeof DATA_LIST_COMPONENT_TYPES_)[keyof typeof DATA_LIST_COMPONENT_TYPES_];

export interface PBoardDataList extends PVisualisation {
  /** Which underlying component `BoardDataList` should render. */
  type: TDataListType;
}

/**
 * BoardDataList is a generic wrapper adapting components that display a data list/record
 * (e.g. RemoteObjectDetail) for use within a Board, switching on `type` to pick the underlying
 * component. Kept simple for now: no config-diff management, but does support editing which
 * fields are displayed via `ObjectDetailConfigDrawer`.
 */
export function BoardDataList(props: PBoardDataList) {
  const { id, utilityBarConfig, dataSource, objectType, zone, setZone, boardDataSource, config, type } = props;

  const { editMode } = useBoard();
  const [openConfig, setOpenConfig] = useState(false);
  const [fields, setFields] = useState<IFieldMeta>(config?.fieldMeta ?? { order: { active: [] } });

  const onConfigSave = (updatedConfig: { fieldMeta: IFieldMeta }) => {
    setFields(updatedConfig.fieldMeta);
    updateComponentConfigAndUpsert(id, updatedConfig, zone, boardDataSource, editMode);
  };

  const configButton: PButton = {
    outline: true,
    position: "right",
    type: "primary",
    onClick: () => setOpenConfig(true),
    icon: "sliders",
    visible: editMode,
  };

  const ubc = mergeUtilityBarConfigs(
    utilityBarConfig,
    {
      buttons: [
        configButton,
      ],
    }
  );

  let Component: JSX.ElementType = RemoteObjectDetail;

  switch (type) {
    case DATA_LIST_COMPONENT_TYPES_.OBJECT_DETAIL:
      Component = RemoteObjectDetail;
  }

  return (
    <>
      <ObjectDetailConfigDrawer
        {...props}
        open={openConfig}
        setOpen={setOpenConfig}
        title="Detail Card Configuration"
        fieldMeta={fields}
        onConfigSave={onConfigSave}
      />
      <Component
        id={id}
        dataSource={dataSource}
        objectType={objectType}
        zone={zone}
        setZone={setZone}
        fields={fields}
        utilityBarConfig={ubc}
      />
    </>
  );
}

