/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  BoardStatistics,
  BoardTable,
  BoardSunburst,
  BoardChart,
  IBoardTargetAndZone,
  BoardMarkdown,
  PUtilityBar,
} from "../..";

export interface PVisualisation extends IBoardTargetAndZone {
  id: string;
  config: any;
  componentType: string;
  size: string;
  utilityBarConfig: PUtilityBar;
}

export function Visualisation(props: PVisualisation) {
  const { componentType } = props;

  switch (componentType) {
    case "table":
      return <BoardTable {...props} />;
    case "count":
    case "statistics":
      return <BoardStatistics {...props} />;
    case "sunburst":
      return <BoardSunburst {...props} />;
    case "chart":
      return <BoardChart {...props} />;
    case "text":
      return <BoardMarkdown {...props} />;
  }
}
