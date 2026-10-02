/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

/**
 * Converts a column name and sort direction into the API sort format used by the backend.
 *
 * @param sortColumn The column to sort by.
 * @param sortType The sort direction, typically "asc" or "desc".
 * @returns The API sort value, or `undefined` when no column is provided.
 */
export function createSort(sortColumn?: string, sortType?: string) {
  if (!sortColumn) return undefined;
  if (sortType === "desc" && !sortColumn.startsWith("-")) {
    return `-${sortColumn}`;
  }
  return sortColumn;
}
