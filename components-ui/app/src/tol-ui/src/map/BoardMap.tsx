/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import {
  UtilityBar,
  PButton,
  updateComponentConfigAndUpsert,
  useBoard,
  PVisualisationComponent,
  mergeUtilityBarConfigs,
  RemoteMap,
  IMapConfig,
  MapConfigDrawer,
  deepCopy,
  NotConfiguredPlaceholder
} from "..";


/** Props for the BoardMap component. */
export interface PBoardMap extends PVisualisationComponent<IMapConfig> {}

/**
 * BoardMap is a wrapper around RemoteMap that provides configuration controls for map selection
 * to be used within a Board.
 */
export function BoardMap(props: PBoardMap) {
  const { id, utilityBarConfig, boardDataSource, zone, config, setConfig } = props;

  const [openConfig, setOpenConfig] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);
  const { editMode } = useBoard();

  const onConfigSave = (updatedConfig: IMapConfig) => {
    setConfig({ ...updatedConfig });
    updateComponentConfigAndUpsert(
      id,
      { ...updatedConfig },
      zone,
      boardDataSource,
      editMode,
    )
    setForceUpdate(!forceUpdate);
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

  const ubc = mergeUtilityBarConfigs(
    utilityBarConfig,
    {
      buttons: [
        configButton
      ],
    }
  )

  const Contents = () => {
    if (!config.longitudeKey || !config.latitudeKey) {
      return <NotConfiguredPlaceholder />;
    } else {
      return null;
    }
  }

  return (
    <>
      <MapConfigDrawer
        {...props}
        open={openConfig}
        setOpen={setOpenConfig}
        onConfigSave={onConfigSave}
        title="Map Configuration"
        config={deepCopy(config)}
      />
      <UtilityBar id={id} {...ubc} />
      <div className="tol-component-contents with-offset">
        <RemoteMap
          {...props}
          latitudeKey={config.latitudeKey}
          longitudeKey={config.longitudeKey}
          attributeKeys={config.attributeKeys}
          contents={Contents()}
          forceUpdate={forceUpdate}
        />
      </div>
    </>
  );
}
