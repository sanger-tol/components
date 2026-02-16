/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import {
  BoardFilters,
  StatisticsConfigDrawer,
  IStatisticsConfig,
  RemoteStatistics,
  deepCopy,
  PButton,
  useBoard,
  PVisualisation,
  updateConfigAndUpsert,
} from "..";

export interface PBoardStatistics extends PVisualisation { }

export function BoardStatistics(props: PBoardStatistics) {
  const { id, utilityBarConfig, boardDataSource, zone } = props;

  const { editMode } = useBoard();

  const initialConfig = props.config && props.config.type ? props.config : { type: "count" };
  const [config, setConfig] = useState<IStatisticsConfig>(initialConfig);
  const [openFilters, setOpenFilters] = useState(false);
  const [openConfig, setOpenConfig] = useState(false);

  const onConfigSave = (updatedConfig: IStatisticsConfig) => {
    setConfig({ ...updatedConfig });
    updateConfigAndUpsert(id, { ...updatedConfig }, zone, boardDataSource);
  };

  const configButton: PButton = {
    outline: true,
    position: "right",
    type: "primary",
    onClick: () => setOpenConfig(true),
    icon: "sliders",
    visible: editMode,
  };

  const filterButton: PButton = {
    outline: true,
    position: "right",
    type: "primary",
    onClick: () => setOpenFilters(true),
    icon: "filter",
    className: "count-filter-button",
    testid: "statistics-filter-button",
    visible: editMode,
  };

  const utilityBarProps = {
    ...utilityBarConfig,
    buttons: [configButton, filterButton],
  };

  return (
    <>
      <BoardFilters
        {...props}
        open={openFilters}
        setOpen={setOpenFilters}
      />
      <StatisticsConfigDrawer
        {...props}
        open={openConfig}
        setOpen={setOpenConfig}
        title="Stats Configuration"
        config={deepCopy(config)}
        onConfigSave={onConfigSave}
      />
      <RemoteStatistics
        {...props}
        type={config.type}
        field={config.field}
        utilityBarConfig={utilityBarProps}
      />
    </>
  );
}
