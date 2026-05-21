/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export const BOARDS = {
  API_DATA_PATH: "/boards",
  BOARD: "board",
  VIEW: "view",
  ZONE: "zone",
  COMPONENT: "component",
  VIEW_BOARD: "view_board",
  ZONE_VIEW: "zone_view",
  COMPONENT_ZONE: "component_zone",
  BOARD_DIFF: "board_diff", // TODO: CHANGE TO ENTITY_DIFF
  DATA_SOURCE_INSTANCE: "data_source_instance",
  OPERATIONS: {
    COPY: "copy",
    REORDER: "reorder",
    GET: "get-entity",
    CREATE_BOARD: "create-board",
    ADD_NEW: "add-entity",
  },
} as const;
