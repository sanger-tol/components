/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { TBoardParams } from "..";
import { BOARDS } from "../constants/api.constants";
import { BOARD_CHILDREN_KEYS } from "../constants/boards.constants";


export const boardParams: TBoardParams = {
  [BOARDS.BOARD]: {
    parentIdField: "board_id",
    parentObjectType: BOARDS.BOARD,
    parentRelationship: BOARDS.BOARD,
    joiningObjectType: BOARDS.VIEW_BOARD,
    childIdField: "view_id",
    childObjectType: BOARDS.VIEW,
    childRelationship: BOARDS.VIEW,
    childrenKey: BOARD_CHILDREN_KEYS.VIEWS,
    joiningObjectRequestedFields: ["board", "view", "board.user.id"],
  },
  [BOARDS.VIEW]: {
    parentIdField: "view_id",
    parentObjectType: BOARDS.VIEW,
    parentRelationship: BOARDS.VIEW,
    joiningObjectType: BOARDS.ZONE_VIEW,
    childIdField: "zone_id",
    childObjectType: BOARDS.ZONE,
    childRelationship: BOARDS.ZONE,
    childrenKey: BOARD_CHILDREN_KEYS.ZONES,
    joiningObjectRequestedFields: ["view", "zone", "zone.data_source_instance.ui_api_details"],
  },
  [BOARDS.ZONE]: {
    parentIdField: "zone_id",
    parentObjectType: BOARDS.ZONE,
    parentRelationship: BOARDS.ZONE,
    joiningObjectType: BOARDS.COMPONENT_ZONE,
    childIdField: "component_id",
    childObjectType: BOARDS.COMPONENT,
    childRelationship: BOARDS.COMPONENT,
    childrenKey: BOARD_CHILDREN_KEYS.COMPONENTS,
    joiningObjectRequestedFields: ["zone", "component", "component.data_source_instance.ui_api_details"],
  }
}
