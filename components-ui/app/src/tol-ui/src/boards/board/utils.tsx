/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  BOARDS,
  IDataObject,
  IView,
  defineBoardEntity,
  BOARD_CHILDREN_KEYS,
  IBoard,
  upsertJoiningBoardEntity,
  User,
  TsDataSource,
  upsertCoreBoardEntity,
} from "../..";

/**
 * Converts a view data object to view parameters for use in the board state.
 * 
 * @param viewDataObject The data object representing the view, retrieved from the data source.
 * @returns An object containing the view parameters to be used in the board state.
 */
export function dataObjectToViewParams(viewDataObject: IDataObject): Partial<IView> {
  return defineBoardEntity<IView>(
    {
      id: viewDataObject.id,
      title: viewDataObject.title,
    },
    BOARDS.VIEW,
    BOARD_CHILDREN_KEYS.ZONES
  );
}

/**
 * Converts a board data object to board parameters for use in the board state.
 * @param boardDataObject The data object representing the board, retrieved from the data source.
 * @returns An object containing the board parameters to be used in the board state.
 */
export function dataObjectToBoardParams(boardDataObject: IDataObject): Partial<IBoard> {
  const owner = boardDataObject.relationships?.user as IDataObject;
  return {
    title: boardDataObject.title,
    ownerUserId: owner.id,
  }
}

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
    user
  );
  const boardId = boardObj?.[0]?.id;

  const viewObj = await upsertCoreBoardEntity(
    BOARDS.VIEW,
    { title: "" },
    boardDataSource,
    user
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
