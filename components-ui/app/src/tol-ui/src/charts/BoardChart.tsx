/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { BoardFilters, Button, Icon, Placeholder, RemoteBarChart, TsDataSource } from "../index";
import { deepCopy } from "../general/utils";
import { useState } from "react";
import { upsertComponentConfig, IZone } from "../boards/utils";
import ChartConfigDrawer from "./ChartConfigDrawer";
import { IChartConfig } from "../models/Board";

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

  const configButtons = [
    <div key="board-sunburst-config" >
      <Button
        outline
        position="right"
        type="primary"
        onClick={() => setOpenConfig(true)}
        icon="sliders"
        className="count-filter-button"
      />
      <Button
        outline
        position="right"
        type="primary"
        onClick={() => setOpenFilters(true)}
        icon="filter"
        className="count-filter-button"
      />
    </div>,
  ];

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
      {config.xAxis && config.breakDownBy ?
        <div style={{ height: '100%' }}>
          <RemoteBarChart
            id={id}
            title={props.title}
            endpoint={objectType}
            baseUrl={props.baseUrl}
            zone={props.zone}
            setZone={props.setZone}
            breakDownBy={config.breakDownBy}
            xAxis={config.xAxis}
            stacked={config.stacked}
            type={config.type}
            buttons={configButtons}
            forceUpdate={forceUpdate}
          />
        </div>
        :
        <div className="tol-table-full">
          <div>
            {configButtons}
          </div>
          <div style={{ height: '100%', marginTop: '6px' }}>
            <Placeholder
              bar
              height={'100%'}
              message={
                <>
                  Please add configure to get started. Click <Icon icon="sliders" size="lg" /> to configure.
                </>
              }
            />
          </div>
        </div>
      }
    </div>
  );
}

export default BoardChart;
