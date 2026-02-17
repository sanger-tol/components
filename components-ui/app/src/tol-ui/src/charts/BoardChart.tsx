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
  ChartConfigDrawer,
  IChartConfig,
  PButton,
  updateConfigAndUpsert,
  useBoard,
  PVisualisation
} from "..";
import { mergeUtilityBarConfigs } from "src/utility-bar/utils";


interface Props extends PVisualisation {}

export function BoardChart(props: Props) {
  const { id, utilityBarConfig, boardDataSource, zone } = props;

  const { editMode } = useBoard();

  const [config, setConfig] = useState<IChartConfig>(props.config);
  const [openFilters, setOpenFilters] = useState(false);
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

  const configButton: PButton = {
    outline: true,
    position: "right",
    type: "primary",
    onClick: () => setOpenConfig(true),
    icon: "sliders",
    visible: editMode,
  }

  const filterButton: PButton = {
    outline: true,
    position: "right",
    type: "primary",
    onClick: () => setOpenFilters(true),
    icon: "filter",
    visible: editMode,
  }

  const Contents = () => {
    if (!config.xAxis && !config.breakDownBy) {
      return (
        <div style={{ height: '100%' }}>
          <Placeholder
            bar
            message={
              <>
                {editMode ? (
                  <>
                    Please add attributes to get started. Click <Icon icon="sliders" size="lg" /> to configure.
                  </>
                ) : (
                  <>
                    No attributes selected.
                  </>
                )}
              </>
            }
          />
        </div>
      )
    }
    return null;
  }

  const ubc = mergeUtilityBarConfigs(
    utilityBarConfig,
    {
      buttons: [
        configButton,
        filterButton,
      ],
    }
  )

  return (
    <>
      <BoardFilters
        {...props}
        open={openFilters}
        setOpen={setOpenFilters}
      />
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
        utilityBarConfig={ubc}
      />
    </>
  );
}
