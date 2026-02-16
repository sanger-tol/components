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
} from "../..";

export interface PVisualisation extends IBoardTargetAndZone {
  id: string;
  config: any;
  componentType: string;
  size: string;
  utilityBarConfig: PUtilityBar;
}

export function Visualisation(props: PVisualisation) {
  const {
    id,
    componentType,
    boardDataSource,
    utilityBarConfig: ubc
  } = props;

  const [title, setTitle] = useState(ubc.title?.text);

  const { editMode } = useBoard();

  const utilityBarConfig = {
    ...ubc,
    title: title || editMode ? {
      text: title,
      editable: editMode,
      onSave: (value: string) => {
        saveTitle(value, id, boardDataSource, BOARDS.COMPONENT);
        setTitle(value);
      }
    } : undefined,
  }

  let Element: JSX.ElementType;

  switch (componentType) {
    case "table":
      Element = BoardTable;
      break;
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
      utilityBarConfig={utilityBarConfig}
    />
  )
}
