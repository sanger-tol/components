/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export const PRIVILEGE = {
  BOARD: {
    WRITABLE: "writable",
    VIEWABLE: "viewable"
  }
} as const;

export const BOARD_ID_FIELDS = {
  BOARD: "board_id",
  VIEW: "view_id",
  ZONE: "zone_id",
} as const;

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

export const MAX_VIEWS_ALLOWED = 10;
export const MAX_VIEWS_ALLOWED_MESSAGE = `A maximum of ${MAX_VIEWS_ALLOWED} Views are allowed per board.`;
export const BOARD_AND_VIEW_TITLE_EMPTY_MESSAGE = "Board and View titles cannot be empty.";
export const ERROR_ADDING_BOARD_ENTITY = "An error occurred while adding the entity. Please try again.";
export const ERROR_FETCHING_BOARD_ENTITY = "An error occurred while fetching the data. Please try again.";
export const ERROR_CREATING_BOARD = "An error occurred while creating the board. Please try again.";
export const ERROR_UPDATING_TITLE = "An error occurred while updating the title. Please try again.";
export const ERROR_REORDERING_BOARD_ENTITY = "An error occurred while reordering. Please refresh the page and try again.";