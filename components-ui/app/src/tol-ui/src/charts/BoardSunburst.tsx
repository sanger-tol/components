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
  SliceByDrawer,
  PButton,
  updateConfigAndUpsert,
  useBoard,
  PVisualisation
} from "..";


interface Props extends PVisualisation { }

export function BoardSunburst(props: Props) {
  const { id, utilityBarConfig, boardObjectType, boardDataSource, size, zone } = props;

  const { editMode } = useBoard();

  const [config, setConfig] = useState<any>(props.config);
  const [openFilters, setOpenFilters] = useState(false);
  const [openConfig, setOpenConfig] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);

  const onConfigSave = (updatedConfig: object) => {
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
              {editMode ? (
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
    visible: editMode,
  }

  const filtersButton: PButton = {
    outline: true,
    position: "right",
    type: "primary",
    onClick: () => setOpenFilters(true),
    icon: "filter",
    className: "count-filter-button",
    visible: editMode,
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
        onConfigSave={onConfigSave}
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
          ...utilityBarConfig,
          title: {
            text: utilityBarConfig.title?.text,
            editable: editMode,
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
