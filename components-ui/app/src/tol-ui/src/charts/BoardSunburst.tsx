/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import {
  Placeholder,
  Icon,
  RemoteSunburst,
  deepCopy,
  SliceByDrawer,
  PButton,
  updateConfigAndUpsert,
  useBoard,
  PVisualisation,
  mergeUtilityBarConfigs
} from "..";


export function BoardSunburst(props: PVisualisation) {
  const { id, utilityBarConfig, boardDataSource, size, zone } = props;

  const { editMode } = useBoard();

  const [config, setConfig] = useState<any>(props.config);
  const [openConfig, setOpenConfig] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);

  const onConfigSave = (updatedConfig: object) => {
    setConfig({ ...updatedConfig });
    updateConfigAndUpsert(
      id,
      { ...updatedConfig },
      zone,
      boardDataSource
    )
    setForceUpdate(!forceUpdate);
  };

  const Contents = () => {
    if (!config.sliceBy || config.sliceBy.length <= 0) {
      return (
        <Placeholder
          pie
          message={
            <>
              {editMode ? (
                <>
                  Please add an attribute to get started. Click <Icon icon="sliders" size="lg" /> to configure.
                </>
              ) : (
                <>
                  No attributes selected.
                </>
              )}
            </>
          }
        />
      );
    }
    return null;
  }

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
        configButton,
      ],
    }
  );

  return (
    <>
      <SliceByDrawer
        {...props}
        sliceBy={config.sliceBy || []} // Pass in a blank array to account for no config
        open={openConfig}
        setOpen={setOpenConfig}
        onConfigSave={onConfigSave}
        title="Sunburst Configuration"
      />
      <RemoteSunburst
        {...props}
        id={id}
        sliceBy={deepCopy(config.sliceBy)}
        contents={Contents()}
        forceUpdate={forceUpdate}
        legendPosition="top"
        noMini={size === "sm"}
        utilityBarConfig={ubc}
      />
    </>
  );
}
