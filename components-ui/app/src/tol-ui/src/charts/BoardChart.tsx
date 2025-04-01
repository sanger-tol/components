/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { BoardFilters, Button, Placeholder, RemoteBarChart, TsDataSource } from "../index";
import { deepCopy } from "../general/utils";
import { useState } from "react";
import { upsertComponentConfig, IZone } from "../boards/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSliders } from "@fortawesome/free-solid-svg-icons";
import ChartConfigDrawer from "./ChartConfigDrawer";
import { HistogramGrouping } from "./utils";

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

interface ChartConfig {
  breakDownBy: string,
  xAxis: string,
  stacked: boolean,
  type: HistogramGrouping,
}

function BoardChart(props: Props) {
  const { id, objectType, size } = props;
  const ds = new TsDataSource();
  const [config, setConfig] = useState<ChartConfig>(props.config);
  const [openFilters, setOpenFilters] = useState(false);
  const [openConfig, setOpenConfig] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);

  const onModalSave = (updatedConfig: ChartConfig) => {
    setConfig({ ...updatedConfig });
    upsertComponentConfig(ds, id, { ...updatedConfig });
    setForceUpdate(!forceUpdate);
  };

  const configButtons = [
    <div key="board-sunburst-config">
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
          />
        </div>
        :
        <div className="tol-table" style={{ height: '100%' }}>
          <div>
            {configButtons}
          </div>
          <div style={{ height: '100%', marginTop: '6px' }}>
            <Placeholder
              bar
              height={'100%'}
              message={
                <>
                  Please add configure to get started. Click
                  <FontAwesomeIcon
                    icon={faSliders}
                    size="lg"
                    style={{ padding: "0 10" }}
                  />
                  to configure.
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
