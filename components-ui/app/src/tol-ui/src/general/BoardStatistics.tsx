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
  PVisualisationComponent,
  updateComponentConfigAndUpsert,
  mergeUtilityBarConfigs,
} from "..";

/** Props for the BoardStatistics component. */
export interface PBoardStatistics extends PVisualisationComponent<IStatisticsConfig> {}

/** BoardStatistics component for displaying and configuring board statistics. */
export function BoardStatistics(props: PBoardStatistics) {
  const { id, utilityBarConfig, boardDataSource, zone, setConfig } = props;

  const { editMode } = useBoard();

  const config = props.config?.type ? props.config : { type: "count" };
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
