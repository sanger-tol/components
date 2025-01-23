/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export const BOARD_URL_PREFIX = "board-data"

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
    GET_BOARD: `${BOARD_URL_PREFIX}/${BoardObjectTypes.BOARD}`,
    GET_BOARD_VIEWS: `${BOARD_URL_PREFIX}/${BoardObjectTypes.VIEW_BOARD}`,
    GET_VIEW: `${BOARD_URL_PREFIX}/${BoardObjectTypes.VIEW}`,
    GET_VIEW_ZONES: `${BOARD_URL_PREFIX}/${BoardObjectTypes.ZONE_VIEW}`,
    GET_ZONE: `${BOARD_URL_PREFIX}/${BoardObjectTypes.ZONE}`,
    GET_ZONE_COMPONENTS: `${BOARD_URL_PREFIX}/${BoardObjectTypes.COMPONENT_ZONE}`,
    GET_COMPONENT: `${BOARD_URL_PREFIX}/${BoardObjectTypes.COMPONENT}`,
}