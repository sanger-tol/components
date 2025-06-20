/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import {
  BoardFilters,
  Icon,
  Placeholder,
  RemoteBarChart,
  deepCopy,
  upsertComponentConfig,
  saveTitle,
  IBoardTargetAndZone,
  ChartConfigDrawer,
  IChartConfig,
  IButton
} from "..";


interface Props extends IBoardTargetAndZone {
  id: string;
  title: string;
  config: any;
  size: string;
}

export function BoardChart(props: Props) {
  const { id, title, boardObjectType, boardDataSource } = props;
  const [config, setConfig] = useState<IChartConfig>(props.config);
  const [openFilters, setOpenFilters] = useState(false);
  const [openConfig, setOpenConfig] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);

  const onModalSave = (updatedConfig: IChartConfig) => {
    setConfig({ ...updatedConfig });
    upsertComponentConfig(boardDataSource, id, { ...updatedConfig });
    setForceUpdate(!forceUpdate);
  };

  const configButton: IButton = {
    outline: true,
    position: "right",
    type: "primary",
    onClick: () => setOpenConfig(true),
    icon: "sliders",
  }

  const filterButton: IButton = {
    outline: true,
    position: "right",
    type: "primary",
    onClick: () => setOpenFilters(true),
    icon: "filter",
  }

  const Contents = () => {
    if (!config.xAxis && !config.breakDownBy) {
      return (
        <div style={{ height: '100%' }}>
          <Placeholder
            bar
            message={
              <>
                Please add configure to get started. Click <Icon icon="sliders" size="lg" /> to configure.
              </>
            }
          />
        </div>
      )
    }
    return null;
  }

  return (
    <div style={{ height: "100%" }}>
      <BoardFilters
        {...props}
        open={openFilters}
        setOpen={setOpenFilters}
      />
      <ChartConfigDrawer
        {...props}
        open={openConfig}
        setOpen={setOpenConfig}
        onConfigSave={onModalSave}
        title="Chart Configuration"
        config={deepCopy(config)}
      />
      <div style={{ height: '100%' }}>
        <RemoteBarChart
          {...props}
          contents={Contents()}
          breakDownBy={config.breakDownBy || ""}
          chartType={config.chartType}
          xAxis={config.xAxis || ""}
          stacked={config.stacked || false}
          type={config.grouping || ""}
          forceUpdate={forceUpdate}
          utilityBarConfig={{
            title: {
              text: title,
              editable: true,
              onSave: (value: string) => {
                saveTitle(value, boardDataSource, id, boardObjectType);
              }
            },
            buttons: [
              configButton,
              filterButton,
            ],
          }}
        />
      </div>
    </div>
  );
}
