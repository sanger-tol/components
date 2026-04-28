/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { TBoardPrivilege } from "../interfaces";

export const PRIVILEGE = {
  BOARD: {
    HIDDEN: "hidden" as TBoardPrivilege,
    VIEWABLE: "viewable" as TBoardPrivilege,
    EDITABLE: "editable" as TBoardPrivilege
  }
}

export const BOARD_ID_FIELDS = {
  BOARD: "board_id",
  VIEW: "view_id",
  ZONE: "zone_id",
}

export const BOARD_CHILDREN_KEYS = {
  VIEWS: "views",
  ZONES: "zones",
  COMPONENTS: "components",
} as const;

export const MY_BOARDS_TITLE = "My Boards";
export const MY_BOARDS_SUB_TITLE = (
  `Here you can view and delete your boards, 
  along with viewing board hierarchy and components 
  of each zone.`
);
