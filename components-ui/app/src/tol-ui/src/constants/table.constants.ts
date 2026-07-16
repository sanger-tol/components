/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export const DEFAULT_ROW_HEIGHT: number = 60;
export const COLLAPSED_ROW_MAX_HEIGHT: number = 150;

export const CELL_PADDING: number = 24;

export const DEFAULT_COLUMN_WIDTH: number = 200;
export const MIN_COLUMN_WIDTH: number = 100;
export const MAX_COLUMN_WIDTH: number = 500;
export const ROW_TOOLS_COLUMN_MAX_WIDTH: number = 50;
export const ROW_TOOLS_COLUMN_SINGLE_ITEM_WIDTH: number = 34;

export const TABLE_CONFIG_DIFF_AUTH_VS_NO_AUTH_NOTICE_DISMISSED_KEY: string =
  "tol_table_config_diff_logged_in_out_sessions_notice_dismissed";

// Error messages for table field metadata
export const TABLE_ERROR_ATTRIBUTE_METADATA_NOT_FOUND = (field: string, objectType: string): string =>
  `Attribute metadata not found for field: ${field} in ${objectType}`;

export const TABLE_ERROR_FIELD_METADATA_NOT_FOUND = (field: string): string =>
  `Field metadata not found for attribute: ${field}`;
