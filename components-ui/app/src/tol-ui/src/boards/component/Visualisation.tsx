/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/
;
import {
  BoardCount,
  BoardTable,
  BoardSunburst,
  BoardChart,
  IBoardTargetAndZone,
  BoardMarkdown
} from "../..";


export interface PVisualisation extends IBoardTargetAndZone {
  id: string;
  config: any;
  title: string;
  componentType: string;
  size: string
}

export function Visualisation(props: PVisualisation) {
  const { componentType } = props;

  switch (componentType) {
    case "table":
      return <BoardTable {...props} />;
    case "count":
      return <BoardCount {...props} />;
    case "sunburst":
      return <BoardSunburst {...props} />;
    case "chart":
      return <BoardChart {...props} />;
    case "text":
      return <BoardMarkdown {...props} />;
  }
}
