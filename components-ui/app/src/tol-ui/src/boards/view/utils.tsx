/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  BOARD_ENTITIES,
  TDataObjectListOrNull,
  TsDataSource,
} from "../..";

/**
 * Fetches the list of published dataspaces (data source instances with ui_api_details) from the board data source.
 * @param boardDataSource The data source to query for published dataspaces.
 * @returns A list of published dataspaces or null if none are found.
 */
export async function getPublishedDataspaces(
  boardDataSource: TsDataSource,
): Promise<TDataObjectListOrNull> {
  return await boardDataSource
    .getListPage({
      objectType: BOARD_ENTITIES.ENTITIES.DATA_SOURCE_INSTANCE,
      pageSize: 100,
      filter: {
        and_: {
          ui_api_details: {
            exists: {}
          },
        },
      }
    })
    .then((data: TDataObjectListOrNull) => {
      return data;
    });
};

/**
 * Moves an item in an ordered list one position up or down by swapping it with its neighbour.
 * @param currentOrder The current ordered array of IDs.
 * @param id The ID of the item to move.
 * @param direction The direction to move the item: "up" (towards index 0) or "down" (towards the end).
 * @returns A new array with the item moved, or the original array if the move is not possible.
 */
export function reorderViaDirection(
  currentOrder: string[],
  id: string,
  direction: "up" | "down"
): string[] {
  const index = currentOrder.indexOf(id);
  if (index === -1) return currentOrder; // ID not found, return original order

  const newIndex = direction === "up" ? index - 1 : index + 1;

  // Check if new index is within bounds
  if (newIndex < 0 || newIndex >= currentOrder.length) {
    return currentOrder; // Can't move, return original order
  }

  // Create a new array with the item moved to the new position
  const newOrder = [...currentOrder];
  [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
  
  return newOrder;
}
