/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export const BOARD_ENTITY_HIERARCHY = [
  "board",
  "view",
  "zone",
  "component",
];

export const BOARD_ENTITIES = {
  ENTITIES: {
    BOARD: "board",
    VIEW: "view",
    ZONE: "zone",
    COMPONENT: "component",
    ENTITY_DIFF: "entity_diff",
    DATA_SOURCE_INSTANCE: "data_source_instance",
  },
  JOINING_ENTITIES: {
    VIEW_BOARD: "view_board",
    ZONE_VIEW: "zone_view",
    COMPONENT_ZONE: "component_zone",
  },
} as const;

export const COMPONENT_TYPES = {
  CHART: "chart",
  TABLE: "table",
  FILTER_BLOCK: "filterBlock",
  STATISTICS: "statistics",
  MAP: "map",
  SUNBURST: "sunburst",
  TEXT: "text",
} as const;

export const STATISTICS_TYPES = {
  COUNT: "count",
  MIN: "min",
  MAX: "max",
  AVG: "avg",
  SUM: "sum",
} as const;

export const CHART_TYPES = {
  BAR: "bar",
  LINE: "line",
  SCATTER: "scatter",
} as const;

export const MY_BOARDS_TITLE = "My Boards";

export const MY_BOARDS_SUB_TITLE = `Here you can view and delete your boards, 
  along with viewing board hierarchy and components 
  of each zone.`;

export const MAX_VIEWS_ALLOWED = 10;
