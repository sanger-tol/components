/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export const BOARD_URL_PREFIX = "board-data";
export const BOARD_DELETE_URL_PREFIX = "board";

export enum BoardObjectTypes {
    BOARD = "board",
    VIEW = "view",
    ZONE = "zone",
    COMPONENT = "component",
    VIEW_BOARD = "view_board",
    ZONE_VIEW = "zone_view",
    COMPONENT_ZONE = "component_zone",
}

export const BOARD_ENDPOINTS = {
    // Standard endpoints
    BOARD: `${BOARD_URL_PREFIX}/${BoardObjectTypes.BOARD}`,
    BOARD_VIEWS: `${BOARD_URL_PREFIX}/${BoardObjectTypes.VIEW_BOARD}`,
    VIEW: `${BOARD_URL_PREFIX}/${BoardObjectTypes.VIEW}`,
    VIEW_ZONES: `${BOARD_URL_PREFIX}/${BoardObjectTypes.ZONE_VIEW}`,
    ZONE: `${BOARD_URL_PREFIX}/${BoardObjectTypes.ZONE}`,
    ZONE_COMPONENTS: `${BOARD_URL_PREFIX}/${BoardObjectTypes.COMPONENT_ZONE}`,
    COMPONENT: `${BOARD_URL_PREFIX}/${BoardObjectTypes.COMPONENT}`,

    // Delete endpoints
    DELETE_BOARD: `${BOARD_DELETE_URL_PREFIX}/${BoardObjectTypes.BOARD}`,
    DELETE_ZONE: `${BOARD_DELETE_URL_PREFIX}/${BoardObjectTypes.ZONE}`,
    DELETE_COMPONENT: `${BOARD_DELETE_URL_PREFIX}/${BoardObjectTypes.COMPONENT}`,
}