/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { BoardFilters, Button, Placeholder, RemoteSunburst, TsDataSource } from "../index";
import { useState } from "react";
import { deepCopy } from "../general/utils";
import { upsertComponentConfig, IZone } from "../boards/utils";
import SliceByDrawer from "./SliceByDrawer";

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

function BoardSunburst(props: Props) {
  const { id, objectType, size } = props;
  const ds = new TsDataSource();
  const [config, setConfig] = useState<any>(props.config);
  const [openFilters, setOpenFilters] = useState(false);
  const [openConfig, setOpenConfig] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);

  const onModalSave = (updatedConfig: object) => {
    setConfig({ ...updatedConfig });
    upsertComponentConfig(ds, id, {...updatedConfig});
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
        //disabled={!config.sliceBy || config.sliceBy.length === 0}
        //disabledTooltip="Must configure before applying filters"
      />
    </div>,
  ];

  return (
    <div style={{height: "100%"}}>
      <BoardFilters
        endpoint={objectType}
        entityType="component"
        open={openFilters}
        setOpen={setOpenFilters}
        {...props}
      />
      <SliceByDrawer
        {...props}
        sliceBy={config.sliceBy || []} //Pass in a blank array to account for no config
        endpoint={objectType}
        open={openConfig}
        setOpen={setOpenConfig}
        onConfigSave={onModalSave}
        title="Sunburst Configuration"
      />
      {config.sliceBy && config.sliceBy.length > 0 ?
        <div style={{height: '100%'}}>
          <RemoteSunburst
            id={id}
            sliceBy={deepCopy(config.sliceBy)}
            title={props.title}
            endpoint={objectType}
            baseUrl={props.baseUrl}
            zone={props.zone}
            setZone={props.setZone}
            forceUpdate={forceUpdate}
            legendPosition="top"
            noMini={size === "sm"}
            buttons={configButtons}
          />
        </div>
      : 
        <div style={{height: '100%'}}>
          <div style={{height: '8%'}}>
            {configButtons}
          </div>
          <div style={{height: '92%'}}>
            <Placeholder pie message='Configure to see SunBurst...'/>
          </div>
        </div>
      }
    </div>
  );
}

export default BoardSunburst;
