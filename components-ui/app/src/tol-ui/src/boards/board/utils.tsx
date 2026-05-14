/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  BOARDS,
  TsDataSource,
  IBoard,
  API_METHODS,
  HTTP_STATUS_CODES,
  MESSAGE_TYPE,
  PopUpMessage,
  BOARD_MESSAGE_TEXT,
  IView,
} from "../..";


export async function copyEntity<T>(
  boardDataSource: TsDataSource,
  entityId: string,
  operation: string,
  parentEntityType: string,
  title: string,
  copyEntityType: string,
  parentEntityId?: string,
): Promise<T | undefined> {
  return (await boardDataSource
    .custom({
      method: API_METHODS.POST,
      resource: `${operation}/${entityId}`,
      body: {
        new_parent_entity_title: title,
        parent_entity_type: parentEntityType,
        ...(parentEntityId ? { parent_entity_id: parentEntityId } : {}),
      },
    })
    .catch(() => {
      PopUpMessage({
        type: MESSAGE_TYPE.ERROR,
        message: BOARD_MESSAGE_TEXT(copyEntityType).BOARD_COPY.IMPORT_ERROR,
      });

      return undefined;
    })) as Promise<T>;
}

export async function copyBoard(
  boardDataSource: TsDataSource,
  entityId: string,
  operation: string,
  parentEntityType: string,
  title: string,
  copyEntityType: string,
  parentEntityId?: string,
): Promise<IBoard | undefined> {
  return await copyEntity<IBoard>(
    boardDataSource,
    entityId,
    operation,
    parentEntityType,
    title,
    copyEntityType,
    parentEntityId,
  );
}

export async function copyView(
  boardDataSource: TsDataSource,
  entityId: string,
  operation: string,
  parentEntityType: string,
  setBoard: (board: IBoard) => void,
  title: string,
  copyEntityType: string,
  currentBoard?: IBoard,
  parentEntityId?: string,
): Promise<IView | undefined> {
  return await copyEntity<IView>(
    boardDataSource,
    entityId,
    operation,
    parentEntityType,
    title,
    copyEntityType,
    parentEntityId,
  )
    .then((res: any) => {
      if (res.status === HTTP_STATUS_CODES.CREATED) {
        PopUpMessage({
          type: MESSAGE_TYPE.SUCCESS,
          message: BOARD_MESSAGE_TEXT(copyEntityType).BOARD_COPY.IMPORT_SUCCESS,
        });

        const newView: IView = res.data;
        const viewsMap = (currentBoard?.children ?? {}) as Record<
          string,
          IView
        >;
        if (currentBoard) {
          setBoard({
            ...currentBoard,
            children: {
              ...viewsMap,
              [newView.id!]: newView,
            } as IBoard["children"],
            order: [...(currentBoard.order ?? []), newView.id!],
          });

          return newView;
        }
      }
    })
    .catch(() => {
      PopUpMessage({
        type: MESSAGE_TYPE.ERROR,
        message: BOARD_MESSAGE_TEXT(copyEntityType).BOARD_COPY.IMPORT_ERROR,
      });

      return undefined;
    });
}

export const copyBoardEntity = async (
  boardDataSource: TsDataSource,
  entityId: string,
  operation: string,
  parentEntityType: string,
  setBoard: (board: IBoard) => void,
  title: string,
  copyEntityType: string,
  currentBoard?: IBoard,
  parentEntityId?: string,
): Promise<IBoard | IView | undefined> => {
  return await copyEntity(
    boardDataSource,
    entityId,
    operation,
    parentEntityType,
    title,
    copyEntityType,
    parentEntityId,
  ).then((res: any) => {
    if (res.status === HTTP_STATUS_CODES.CREATED) {
      PopUpMessage({
        type: MESSAGE_TYPE.SUCCESS,
        message: BOARD_MESSAGE_TEXT(copyEntityType).BOARD_COPY.IMPORT_SUCCESS,
      });

      if (copyEntityType === BOARDS.VIEW && currentBoard) {
      } else {
        setBoard(res.data); // full board replace (existing behaviour)

        if (copyEntityType === BOARDS.BOARD) {
          const boardId = res.data.id;
          const firstViewId = Object.keys(res.data.children?.[0] ?? {})[0];
          window.history.replaceState(
            null,
            "",
            `/${BOARDS.BOARD}/${boardId}?${BOARDS.VIEW}=${firstViewId}`,
          );
        }
      }
    }
    return res.data;
  });
};
