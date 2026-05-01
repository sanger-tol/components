/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  BOARDS,
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
      objectType: BOARDS.DATA_SOURCE_INSTANCE,
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
