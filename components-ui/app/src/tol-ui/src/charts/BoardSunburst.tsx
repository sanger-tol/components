/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { BoardFilters, Button, Placeholder, RemoteSunburst, TsDataSource } from "../index";
import { useState } from "react";
import { deepCopy } from "../general/utils";
import { upsertComponentConfig, IZone } from "../boards/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSliders } from "@fortawesome/free-solid-svg-icons";
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
      <SliceByDrawer
        {...props}
        sliceBy={config.sliceBy || []} // Pass in a blank array to account for no config
        endpoint={objectType}
        open={openConfig}
        setOpen={setOpenConfig}
        onConfigSave={onModalSave}
        title="Sunburst Configuration"
      />
      {config.sliceBy && config.sliceBy.length > 0 ?
        <div style={{ height: '100%' }}>
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
        <div className="tol-table" style={{ height: '100%' }}>
          <div>
            {configButtons}
          </div>
          <div style={{ height: '100%', marginTop: '6px' }}>
            <Placeholder
              pie
              height={'100%'}
              message={
                <>
                  Please add an attribute to get started. Click
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

export default BoardSunburst;
