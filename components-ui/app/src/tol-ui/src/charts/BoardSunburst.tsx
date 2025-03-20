/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { BoardFilters, Button, Placeholder, RemoteSunburst, TsDataSource } from "../index";
import { useState } from "react";
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
}

function BoardSunburst(props: Props) {
  const { id, objectType } = props;
  const ds = new TsDataSource();
  const [config, setConfig] = useState<any>(props.config);
  const [openFilters, setOpenFilters] = useState(false);
  const [openConfig, setOpenConfig] = useState(false);

  const onModalSave = (updatedConfig: object) => {
      setConfig({ ...updatedConfig });
      upsertComponentConfig(ds, id, {...updatedConfig});
    };

  const configButtons = [
    <span key="board-sunburst-config">
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
    </span>,
  ];

  return (
    <div style={{height: "100%"}}>
      {configButtons}
      <BoardFilters
        endpoint={objectType}
        entityType="component"
        open={openFilters}
        setOpen={setOpenFilters}
        {...props}
      />
      <SliceByDrawer //This needs initialAttributes to be set to dliceBy
        {...props}
        sliceBy={config.sliceBy}
        endpoint={objectType}
        open={openConfig}
        setOpen={setOpenConfig}
        onConfigSave={onModalSave}
      />
      {config.sliceBy && config.sliceBy.length > 0 ?
        <div>
          <RemoteSunburst
            id={id}
            sliceBy={config.sliceBy}
            title={props.title}
            endpoint={objectType}
            baseUrl={props.baseUrl}
            zone={props.zone}
            setZone={props.setZone}
          />
        </div>
      : 
        <div style={{height: '100%'}}>
          <Placeholder pie message='Configure to see bar chart...' height={'100%'} />
        </div>
      }
    </div>
  );
}

export default BoardSunburst;
