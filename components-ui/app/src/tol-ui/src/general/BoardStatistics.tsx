/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import {
  StatisticsConfigDrawer,
  IStatisticsConfig,
  RemoteStatistics,
  deepCopy,
  PButton,
  useBoard,
  PVisualisation,
  updateComponentConfigAndUpsert,
  mergeUtilityBarConfigs,
} from "..";


export function BoardStatistics(props: PVisualisation) {
  const { id, utilityBarConfig, boardDataSource, zone } = props;

  const { editMode } = useBoard();

  const initialConfig = props.config && props.config.type ? props.config : { type: "count" };
  const [config, setConfig] = useState<IStatisticsConfig>(initialConfig);
  const [openConfig, setOpenConfig] = useState(false);

  const onConfigSave = (updatedConfig: IStatisticsConfig) => {
    setConfig({ ...updatedConfig });
    updateComponentConfigAndUpsert(id, { ...updatedConfig }, zone, boardDataSource, editMode);
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

  return (
    <div className="tol-component-contents" data-testid="board-component-statistics">
      <StatisticsConfigDrawer
        {...props}
        open={openConfig}
        setOpen={setOpenConfig}
        title="Stats Configuration"
        config={deepCopy(config)}
        onConfigSave={onConfigSave}
      />
      <RemoteStatistics
        {...props}
        type={config.type}
        field={config.field}
        utilityBarConfig={ubc}
      />
    </div>
  );
}
