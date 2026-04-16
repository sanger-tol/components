/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  TsDataSource,
  BOARDS,
  TDataObjectListOrNull,
  TDataObjectOrNull,
} from "../..";


export async function getBoard(
  id: string,
  boardDataSource: TsDataSource
): Promise<{ boardTitle: any; boardFilter: any; boardUserId: any; views: TDataObjectListOrNull } | undefined> {
  return await boardDataSource
    .getOne({
      objectType: BOARDS.BOARD,
      id: id,
    })
    .then(async (board: TDataObjectOrNull) => {
      if (!board) return;
      const views = await getViews(board.id, boardDataSource);

      return {
        boardTitle: board.title,
        boardFilter: board.filter,
        boardUserId: board.relationships?.["user"]?.["id"],
        views: views,
      };
    });
}

async function getViews(
  id: string,
  boardDataSource: TsDataSource
): Promise<TDataObjectListOrNull> {
  return await boardDataSource
    .getListPage({
      objectType: BOARDS.VIEW_BOARD,
      filter: {
        and_: {
          "board.id": { eq: { value: id } },
        },
      }
    })
    .then(async (data: TDataObjectListOrNull) => {
      const ids = await Promise.all(
        data?.map(async (viewBoard: any) => {
          const view = await viewBoard.fetchRelationships.view;
          return view.id;
        }) || []
      );
      return getViewsData(ids, boardDataSource);
    });
}

async function getViewsData(
  ids: string[],
  boardDataSource: TsDataSource
): Promise<TDataObjectListOrNull> {
  return await boardDataSource
    .getListPage({
      objectType: BOARDS.VIEW,
      filter: {
        and_: {
          id: { in_list: { value: ids } },
        },
      },
    })
}
