/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import {
  UtilityBar,
  PButton,
  updateConfigAndUpsert,
  useBoard,
  PVisualisation,
  mergeUtilityBarConfigs,
  RemoteMap,
  IMapConfig,
  MapConfigDrawer,
  deepCopy,
  NoAttributesPlaceholder
} from "..";


export function BoardMap(props: PVisualisation) {
  const { id, utilityBarConfig, boardDataSource, zone } = props;

  const [config, setConfig] = useState<IMapConfig>(props.config);
  const [openConfig, setOpenConfig] = useState(false);
  const { editMode } = useBoard();

  const Contents = () => {
    if (!config.longitudeKey || !config.latitudeKey) {
      return <NoAttributesPlaceholder />;
    }
  }

  const onConfigSave = (updatedConfig: IMapConfig) => {
    setConfig({ ...updatedConfig });
    updateConfigAndUpsert(
      id,
      { ...updatedConfig },
      zone,
      boardDataSource
    )
  };

  const configButton: PButton = {
    outline: true,
    position: "right",
    type: "primary",
    onClick: () => setOpenConfig(true),
    icon: "sliders",
    className: "count-filter-button",
    visible: editMode,
  }

  const utilityBarConfigMerged = mergeUtilityBarConfigs(
    utilityBarConfig,
    {
      buttons: [
        configButton
      ],
    }
  )

  return (
    <>
      <MapConfigDrawer
        {...props}
        open={openConfig}
        setOpen={setOpenConfig}
        onConfigSave={onConfigSave}
        title="Chart Configuration"
        config={deepCopy(config)}
      />
      <UtilityBar id={id} {...utilityBarConfigMerged} />
      <div className="tol-component-contents with-offset">
        <RemoteMap
          latitudeKey={config.latitudeKey}
          longitudeKey={config.longitudeKey}
          contents={Contents()}
          {...props}
        />
      </div>
    </>
  );
}
