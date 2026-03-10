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
  updateConfigAndUpsert,
  PVisualisation,
  NoAttributesPlaceholder,
} from "..";


export function BoardChart(props: PVisualisation) {
  const { id, boardDataSource, zone } = props;

  const [config, setConfig] = useState<IChartConfig>(props.config);
  const [openConfig, setOpenConfig] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);

  const onConfigSave = (updatedConfig: IChartConfig) => {
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
    if (!config.xAxis && !config.breakDownBy) {
      return <NoAttributesPlaceholder />;
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
      />
    </>
  );
}
