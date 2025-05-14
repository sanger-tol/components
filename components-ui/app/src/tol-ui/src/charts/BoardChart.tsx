/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { BoardFilters, Icon, Placeholder, RemoteBarChart, TsDataSource } from "../index";
import { deepCopy } from "../general/utils";
import { useState } from "react";
import { upsertComponentConfig, IZone, saveTitle } from "../boards/utils";
import ChartConfigDrawer from "./ChartConfigDrawer";
import { IChartConfig } from "../models";
import { IButton } from "../general/Button"

interface Props {
  id: string;
  objectType: string;
  baseUrl?: string;
  title: string;
  config: any;
  zone: IZone;
  setZone: any;
  size: string;
}

function BoardChart(props: Props) {
  const { id, objectType } = props;
  const ds = new TsDataSource();
  const [config, setConfig] = useState<IChartConfig>(props.config);
  const [openFilters, setOpenFilters] = useState(false);
  const [openConfig, setOpenConfig] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);

  const onModalSave = (updatedConfig: IChartConfig) => {
    setConfig({ ...updatedConfig });
    upsertComponentConfig(ds, id, { ...updatedConfig });
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
        endpoint={objectType}
        entityType="component"
        open={openFilters}
        setOpen={setOpenFilters}
        {...props}
      />
      <ChartConfigDrawer
        {...props}
        endpoint={objectType}
        open={openConfig}
        setOpen={setOpenConfig}
        onConfigSave={onModalSave}
        title="Chart Configuration"
        config={deepCopy(config)}
        ds={ds}
      />
      <div style={{ height: '100%' }}>
        <RemoteBarChart
          id={id}
          contents={Contents()}
          endpoint={objectType}
          baseUrl={props.baseUrl}
          zone={props.zone}
          setZone={props.setZone}
          breakDownBy={config.breakDownBy || ""}
          chartType={config.chartType}
          xAxis={config.xAxis || ""}
          stacked={config.stacked || false}
          type={config.grouping || ""}
          forceUpdate={forceUpdate}
          utilityBarConfig={{
            title: {
              title: props.title,
              editable: true,
              onSave: (value: string) => {
                saveTitle(value, ds, id, 'component');
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

export default BoardChart;
