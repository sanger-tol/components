/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import {
  BoardStatistics,
  BoardTable,
  BoardSunburst,
  BoardChart,
  IBoardTargetAndZone,
  BoardMarkdown,
  PUtilityBar,
  useBoard,
  saveTitle,
  BOARDS,
  PButton,
  TitleTooltip,
  generateFilter,
  mergeUtilityBarConfigs,
  BoardFilters,
} from "../..";


export interface PVisualisation extends IBoardTargetAndZone {
  id: string;
  config: any;
  componentType: string;
  size: string;
  title: string;
  utilityBarConfig?: PUtilityBar;
}

export function Visualisation(props: PVisualisation) {
  const {
    id,
    objectType,
    componentType,
    boardDataSource,
    zone,
    dataSource,
    utilityBarConfig,
  } = props;

  const [title, setTitle] = useState(props.title);
  const [openFilters, setOpenFilters] = useState(false);

  const { editMode } = useBoard();

  const filter = generateFilter(zone, id);

  const dragButton: PButton = {
    outline: true,
    position: "right",
    type: "edit",
    icon: "up-down-left-right",
    className: "tol-drag-handle",
    visible: editMode,
  }

  const filterButton: PButton = {
    outline: true,
    position: "right",
    type: "primary",
    onClick: () => setOpenFilters(true),
    icon: "filter",
    visible: editMode,
  }

  const FilterDrawer = (
    <BoardFilters
      {...props}
      open={openFilters}
      setOpen={setOpenFilters}
    />
  )

  const Description = (
    <TitleTooltip
      title={title}
      objectType={objectType}
      dataSource={dataSource}
      filter={filter}
    />
  );

  const ubc = mergeUtilityBarConfigs(
    utilityBarConfig,
    {
      title: title || editMode ? {
        text: title,
        editable: editMode,
        onSave: (value: string) => {
          saveTitle(value, id, boardDataSource, BOARDS.COMPONENT);
          setTitle(value);
        }
      } : undefined,
      description: Description,
      buttons: [
        dragButton,
        filterButton,
      ],
      elements: [
        FilterDrawer
      ]
    }
  )

  let Element: JSX.ElementType = BoardTable;

  switch (componentType) {
    case "count":
    case "statistics":
      Element = BoardStatistics;
      break;
    case "sunburst":
      Element = BoardSunburst;
      break;
    case "chart":
      Element = BoardChart;
      break;
    case "text":
      Element = BoardMarkdown;
      break;
  }

  return (
    <Element
      {...props}
      utilityBarConfig={ubc}
    />
  )
}
