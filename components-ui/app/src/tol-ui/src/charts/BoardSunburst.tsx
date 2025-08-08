/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import {
  BoardFilters,
  Placeholder,
  Icon,
  RemoteSunburst,
  deepCopy,
  saveTitle,
  IBoardTargetAndZone,
  SliceByDrawer,
  PButton,
  updateConfigAndUpsert,
  PRIVILEGE,
  useBoardPrivilege
} from "..";


interface Props extends IBoardTargetAndZone {
  id: string;
  title: string;
  config: any;
  size: string;
}

export function BoardSunburst(props: Props) {
  const { id, boardObjectType, boardDataSource, size, zone } = props;
  const [config, setConfig] = useState<any>(props.config);
  const [openFilters, setOpenFilters] = useState(false);
  const [openConfig, setOpenConfig] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);
  const { privilege } = useBoardPrivilege()

  const onModalSave = (updatedConfig: object) => {
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
    if (!config.sliceBy || config.sliceBy.length <= 0) {
      return (
        <Placeholder
          pie
          message={
            <>
              {privilege === PRIVILEGE.BOARD.EDITABLE ? (
                <>
                  Please add an attribute to get started. Click <Icon icon="sliders" size="lg" /> to configure.
                </>
              ) : (
                <>
                  No attributes selected.
                </>
              )}
            </>
          }
        />
      );
    }
    return null;
  }

  const configButton: PButton = {
    outline: true,
    position: "right",
    type: "primary",
    onClick: () => setOpenConfig(true),
    icon: "sliders",
    className: "count-filter-button",
    visible: privilege === PRIVILEGE.BOARD.EDITABLE,
  }

  const filtersButton: PButton = {
    outline: true,
    position: "right",
    type: "primary",
    onClick: () => setOpenFilters(true),
    icon: "filter",
    className: "count-filter-button",
    visible: privilege === PRIVILEGE.BOARD.EDITABLE,
  }

  return (
    <>
      <BoardFilters
        {...props}
        open={openFilters}
        setOpen={setOpenFilters}
      />
      <SliceByDrawer
        {...props}
        sliceBy={config.sliceBy || []} // Pass in a blank array to account for no config
        open={openConfig}
        setOpen={setOpenConfig}
        onConfigSave={onModalSave}
        title="Sunburst Configuration"
      />
      <RemoteSunburst
        {...props}
        id={id}
        sliceBy={deepCopy(config.sliceBy)}
        contents={Contents()}
        forceUpdate={forceUpdate}
        legendPosition="top"
        noMini={size === "sm"}
        utilityBarConfig={{
          title: {
            text: props.title,
            editable: privilege === PRIVILEGE.BOARD.EDITABLE,
            onSave: (value: string) => {
              saveTitle(value, id, boardObjectType, boardDataSource);
            }
          },
          buttons: [
            configButton,
            filtersButton
          ],
        }}
      />
    </>
  );
}
