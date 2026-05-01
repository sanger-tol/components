/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  BOARDS,
  upsertJoiningBoardEntity,
  User,
  TsDataSource,
  upsertCoreBoardEntity,
} from "../..";

// TODO: REMOVE WITH NEW ENDPOINTS!
/**
 * Creates a new board and its associated view.
 * @param boardDataSource The data source to use for creating the board and view.
 * @param user The user creating the board and view.
 */
export async function createBoardAndView(
  boardDataSource: TsDataSource,
  user: User,
): Promise<string | undefined> {
  const boardObj = await upsertCoreBoardEntity(
    BOARDS.BOARD,
    { title: "Untitled" },
    boardDataSource,
    user,
  );
  const boardId = boardObj?.[0]?.id;

  const viewObj = await upsertCoreBoardEntity(
    BOARDS.VIEW,
    { title: "" },
    boardDataSource,
    user,
  );
  const viewId = viewObj?.[0]?.id;

  await upsertJoiningBoardEntity(
    BOARDS.VIEW_BOARD,
    {
      order: 1,
      board_id: boardId,
      view_id: viewId,
    },
    boardDataSource,
  );

  return boardId;
}
