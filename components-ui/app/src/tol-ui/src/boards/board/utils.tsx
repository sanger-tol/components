/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  BOARDS,
  upsertJoiningBoardEntity,
  IUser,
  TsDataSource,
  upsertCoreBoardEntity,
  IBoard,
  API_METHODS,
  HTTP_STATUS_CODES,
  MESSAGE_TYPE,
  PopUpMessage,
  BOARD_MESSAGE_TEXT,
} from "../..";

// TODO: REMOVE WITH NEW ENDPOINTS!
/**
 * Creates a new board and its associated view.
 * @param boardDataSource The data source to use for creating the board and view.
 * @param user The user creating the board and view.
 */
export async function createBoardAndView(
  boardDataSource: TsDataSource,
  user: IUser,
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

export const copyBoardEntity = async (
  boardDataSource: TsDataSource,
  entityId: string,
  operation: string,
  entityType: string,
  setBoard: (board: IBoard) => void,
  title: string,
) => {
  await boardDataSource
    .custom({
      method: API_METHODS.POST,
      resource: `${operation}/${entityId}`,
      body: {
        new_parent_entity_title: title,
        parent_entity_type: entityType,
      },
    })
    .then((res) => {
      if (res.status === HTTP_STATUS_CODES.CREATED) {
        PopUpMessage({
          type: MESSAGE_TYPE.SUCCESS,
          message: BOARD_MESSAGE_TEXT(entityType).BOARD_COPY.COPY_SUCCESS,
        });
        setBoard(res.data as IBoard);
        if (entityType === BOARDS.BOARD) {
          window.history.replaceState(
            null,
            "",
            `/${BOARDS.BOARD}/${res.data.id}`,
          );
        }
      }
    })
    .catch(() => {
      PopUpMessage({
        type: MESSAGE_TYPE.ERROR,
        message: BOARD_MESSAGE_TEXT(entityType).BOARD_COPY.COPY_ERROR,
      });
    });
};
