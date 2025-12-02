/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

/**
 * A flexible visualization component that renders different types of board components based on the componentType prop.
 * This component acts as a factory that selects and renders the appropriate visualization component.
 * 
 * @auto-doc
 * 
 * @prop id - Unique identifier for the visualization instance
 * @prop config - Configuration object containing settings for the visualization
 * @prop componentType - The type of visualization to render (table, count, sunburst, chart, or text)
 * @prop size - Size specification for the visualization component
 * @prop utilityBarConfig - Configuration for the utility bar associated with this visualization
 * 
 * @remarks
 * This component uses a switch statement to determine which board component to render.
 * All props are passed through to the selected component using the spread operator.
 * The component extends IBoardTargetAndZone which provides additional board-related functionality.
 * 
 * @example Basic Table Visualization
 * <Visualisation
 *   id="table-1"
 *   componentType="table"
 *   config={{ columns: ['name', 'value'] }}
 *   size="large"
 *   utilityBarConfig={{ showExport: true }}
 * />
 */

import {
  BoardCount,
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
      return <BoardCount {...props} />;
    case "sunburst":
      return <BoardSunburst {...props} />;
    case "chart":
      return <BoardChart {...props} />;
    case "text":
      return <BoardMarkdown {...props} />;
  }
}