/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  BOARD_ENTITIES,
  BOARDS_API,
  TsDataSource,
  IBoard,
  API_METHODS,
  HTTP_STATUS_CODES,
  MESSAGE_TYPE,
  PopUpMessage,
  BOARD_MESSAGE_TEXT,
  IView,
  generateId,
  getEntityPrefix,
  IZone,
  upsertTitle,
  TBoardEntity,
  TBoardChildren,
  postAddBoardEntity,
  addBoardEntityInParentState,
  TBoardEntityType,
} from "../..";


export async function copyBoardEntity<T>(
  boardDataSource: TsDataSource,
  entityId: string,
  operation: string,
  parentEntityType: string,
  title: string,
  copyEntityType: TBoardEntity,
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
    .then((res: any) => {
      if (res.status === HTTP_STATUS_CODES.CREATED) {
        PopUpMessage({
          type: MESSAGE_TYPE.SUCCESS,
          message: BOARD_MESSAGE_TEXT(copyEntityType).BOARD_COPY.IMPORT_SUCCESS,
        });
        return res.data;
      }
    })
    .catch(() => {
      PopUpMessage({
        type: MESSAGE_TYPE.ERROR,
        message: BOARD_MESSAGE_TEXT(copyEntityType).BOARD_COPY.IMPORT_ERROR,
      });
      return undefined;
    })) as Promise<T>;
}

export function replaceURLState(boardId: string, viewId: string) {
  window.history.replaceState(
    null,
    "",
    `/${BOARD_ENTITIES.BOARD}/${boardId}?${BOARD_ENTITIES.VIEW}=${viewId}`,
  );
}

export async function copyBoard(
  boardDataSource: TsDataSource,
  entityId: string,
  parentEntityType: string,
  title: string,
  copyEntityType: TBoardEntityType,
): Promise<IBoard | undefined> {
  return await copyBoardEntity<IBoard>(
    boardDataSource,
    entityId,
    BOARDS_API.OPERATIONS.COPY,
    parentEntityType,
    title,
    copyEntityType,
  ).then((newBoard: IBoard | undefined) => {
    if (!newBoard) return;
    const boardId = newBoard.id;
    const firstViewId = Object.keys(newBoard.children ?? {})[0];
    replaceURLState(boardId!, firstViewId!);
    return newBoard;
  });
}

export async function copyView(
  boardDataSource: TsDataSource,
  entityId: string,
  parentEntityType: string,
  title: string,
  copyEntityType: TBoardEntity,
  currentBoard?: IBoard,
  parentEntityId?: string,
): Promise<{ view: IView; updatedBoard: IBoard } | undefined> {
  return await copyBoardEntity<IView>(
    boardDataSource,
    entityId,
    BOARDS_API.OPERATIONS.COPY,
    parentEntityType,
    title,
    copyEntityType,
    parentEntityId,
  ).then((newView: IView | undefined) => {
    if (!newView || !currentBoard) return;
    const viewsMap = currentBoard.children ?? {} as Record<string, IView>;
    const updatedBoard: IBoard = {
      ...currentBoard,
      children: { ...viewsMap, [newView.id!]: newView } as IBoard["children"],
      order: [...(currentBoard.order ?? []), newView.id!],
    };
    replaceURLState(currentBoard.id!, newView.id!);
    return { view: newView, updatedBoard };
  });
}

export async function onViewTitleSave(
  newTitle: string,
  viewId: string,
  board: IBoard,
  boardDataSource: TsDataSource,
): Promise<IBoard | undefined> {
  const viewsMap = board?.children ?? {};

  const currentTitle = viewsMap[viewId]?.title;
  if (currentTitle === newTitle) return;

  await upsertTitle(newTitle, viewId, boardDataSource);

  return {
    ...board,
    children: {
      ...viewsMap,
      [viewId]: {
        ...viewsMap[viewId],
        title: newTitle,
      },
    } as TBoardChildren<IView>,
  } as IBoard;
}

export function updateViewInUrl(viewId: string) {
  const params = new URLSearchParams(location.search);
  params.set("view", viewId);
  window.history.replaceState(null, "", `?${params.toString()}`);
}

export async function onAddView(
  boardDataSource: TsDataSource,
  board: IBoard,
) {
  if (!board.id) return;
  return postAddBoardEntity(boardDataSource, board.id!)
    .then((res) => {
      const view = res.data;
      updateViewInUrl(view.id);
      return addBoardEntityInParentState<IView, IBoard>(
        BOARD_ENTITIES.VIEW,
        view,
        board
      )
    })
};
