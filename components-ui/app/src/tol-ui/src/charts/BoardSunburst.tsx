/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { BoardFilters, Placeholder, Icon, RemoteSunburst, TsDataSource } from "../index";
import { useState } from "react";
import { deepCopy } from "../general/utils";
import { upsertComponentConfig, saveTitle } from "../boards/utils";
import { IZone } from "../models";
import SliceByDrawer from "./SliceByDrawer";
import { IButton } from "../general/Button";

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

  const Contents = () => {
    if (!config.sliceBy || config.sliceBy.length <= 0) {
      return (
        <div style={{ height: '100%', marginTop: '6px' }}>
          <Placeholder
            pie
            height={'100%'}
            message={
              <>
                Please add an attribute to get started. Click <Icon icon="sliders" size="lg" /> to configure.
              </>
            }
          />
        </div>
      )
    }

    return null;
  }

  const configButton: IButton = {
    outline: true,
    position: "right",
    type: "primary",
    onClick: () => setOpenConfig(true),
    icon: "sliders",
    className: "count-filter-button",
  }

  const filtersButton: IButton = {
    outline: true,
    position: "right",
    type: "primary",
    onClick: () => setOpenFilters(true),
    icon: "filter",
    className: "count-filter-button",
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
      <SliceByDrawer
        {...props}
        sliceBy={config.sliceBy || []} // Pass in a blank array to account for no config
        endpoint={objectType}
        open={openConfig}
        setOpen={setOpenConfig}
        onConfigSave={onModalSave}
        title="Sunburst Configuration"
      />
        <div style={{ height: '100%' }}>
          <RemoteSunburst
            id={id}
            sliceBy={deepCopy(config.sliceBy)}
            contents={Contents()}
            endpoint={objectType}
            baseUrl={props.baseUrl}
            zone={props.zone}
            setZone={props.setZone}
            forceUpdate={forceUpdate}
            legendPosition="top"
            noMini={size === "sm"}
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
                filtersButton
              ],
            }}
          />
        </div>
    </div>
  );
}

export default BoardSunburst;
