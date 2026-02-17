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
} from "../..";

export interface PVisualisation extends IBoardTargetAndZone {
  id: string;
  config: any;
  componentType: string;
  size: string;
  title: string;
}

export function Visualisation(props: PVisualisation) {
  const {
    id,
    objectType,
    componentType,
    boardDataSource,
    zone,
    dataSource,
  } = props;

  const [title, setTitle] = useState(props.title);

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

  const Description = (
    <TitleTooltip
      title={title}
      objectType={objectType}
      dataSource={dataSource}
      filter={filter}
    />
  );

  const ubc = {
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
    ]
  }

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
