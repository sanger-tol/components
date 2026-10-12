/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import {
  RemoteBarChart,
  deepCopy,
  ChartConfigDrawer,
  IChartConfig,
  updateComponentConfigAndUpsert,
  PVisualisationComponent,
  NotConfiguredPlaceholder,
  useBoard,
  PButton,
  mergeUtilityBarConfigs
} from "..";

/** Props for the BoardChart component. */
export interface PBoardChart extends PVisualisationComponent<IChartConfig> {}

/** Component for displaying and configuring a bar chart on the board. */
export function BoardChart(props: PBoardChart) {
  const { id, utilityBarConfig, boardDataSource, zone, config, setConfig } = props;

  const { editMode } = useBoard();

  const [openConfig, setOpenConfig] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);

  const onConfigSave = (updatedConfig: IChartConfig) => {
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

  const newUtilityBarConfig = mergeUtilityBarConfigs(
    utilityBarConfig,
    {
      buttons: [
        configButton,
      ],
    }
  );

  const Contents = () => {
    if (!config.xAxis && !config.breakDownBy) {
      return <NotConfiguredPlaceholder />;
    }
  }

  return (
    <>
      <ChartConfigDrawer
        {...props}
        open={openConfig}
        setOpen={setOpenConfig}
        onConfigSave={onConfigSave}
        title="Chart Configuration"
        config={deepCopy(config)}
      />
      <RemoteBarChart
        {...props}
        contents={Contents()}
        breakDownBy={config.breakDownBy || ""}
        chartType={config.chartType}
        xAxis={config.xAxis || ""}
        stacked={config.stacked || false}
        type={config.grouping || ""}
        forceUpdate={forceUpdate}
        utilityBarConfig={newUtilityBarConfig}
      />
    </>
  );
}
