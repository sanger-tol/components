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
  IView,
  API_UTILITY_OPERATIONS,
  saveTitle,
  generateId,
  getEntityPrefix,
  getNextTitle,
  IZone,
  TBoardEntity,
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

export async function copyEntity<T>(
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
    `/${BOARDS.BOARD}/${boardId}?${BOARDS.VIEW}=${viewId}`,
  );
}

export async function copyBoard(
  boardDataSource: TsDataSource,
  entityId: string,
  parentEntityType: string,
  setBoard: (board: IBoard) => void,
  title: string,
  copyEntityType: TBoardEntity,
): Promise<IBoard | undefined> {
  return await copyEntity<IBoard>(
    boardDataSource,
    entityId,
    API_UTILITY_OPERATIONS.BOARD_COPY,
    parentEntityType,
    title,
    copyEntityType,
  ).then((newBoard: IBoard | undefined) => {
    if (!newBoard) return;
    setBoard(newBoard);
    const boardId = newBoard.id;
    const firstViewId = Object.keys(newBoard.children?.[0] ?? {})[0];
    replaceURLState(boardId!, firstViewId!);
    return newBoard;
  });
}

export async function copyView(
  boardDataSource: TsDataSource,
  entityId: string,
  parentEntityType: string,
  setBoard: (board: IBoard) => void,
  title: string,
  copyEntityType: TBoardEntity,
  currentBoard?: IBoard,
  parentEntityId?: string,
): Promise<IView | undefined> {
  return await copyEntity<IView>(
    boardDataSource,
    entityId,
    API_UTILITY_OPERATIONS.VIEW_COPY,
    parentEntityType,
    title,
    copyEntityType,
    parentEntityId,
  ).then((newView: IView | undefined) => {
    if (!newView) return;
    const viewsMap = (currentBoard?.children?.[0] ?? {}) as Record<
      string,
      IView
    >;
    if (currentBoard) {
      setBoard({
        ...currentBoard,
        children: [
          { ...viewsMap, [newView.id!]: newView },
        ] as unknown as IBoard["children"],
        order: [...(currentBoard.order ?? []), newView.id!],
      });
      replaceURLState(currentBoard.id!, newView.id!);
      return newView;
    }
  });
}

export async function onViewTitleSave(
  value: string,
  viewId: string,
  board: IBoard,
  setBoard: (board: IBoard) => void,
  boardDataSource: TsDataSource,
) {
  const viewsMap = board?.children?.[0] ?? {};

  const currentTitle = viewsMap[viewId]?.title;
  if (currentTitle === value) return;


  await saveTitle(value, viewId, boardDataSource, BOARDS.VIEW);

  setBoard({
    ...board,
    children: [
      {
        ...viewsMap,
        [viewId]: {
          ...viewsMap[viewId],
          title: value,
        },
      },
    ] as unknown as IBoard["children"],
  } as IBoard);
}

export function updateViewInUrl(viewId: string) {
  const params = new URLSearchParams(location.search);
  params.set("view", viewId);
  window.history.replaceState(null, "", `?${params.toString()}`);
}

export function onAddView(
  board: IBoard,
  setBoard: (board: IBoard) => void,
  setActiveViewId: (viewId: string) => void,
) {
  const newViewId = generateId(getEntityPrefix(BOARDS.VIEW));
  const viewsMap = board?.children?.[0] ?? {};
  const newViewTitle = getNextTitle<IBoard>(
    { ...board, views: viewsMap } as any,
    BOARDS.BOARD,
    BOARDS.VIEW,
  );
  const newView: IView = {
    id: newViewId,
    title: newViewTitle,
    children: [{}] as unknown as Record<string, IZone>,
    order: [],
  };
  setBoard({
    ...board,
    children: [
      { ...viewsMap, [newViewId]: newView },
    ] as unknown as IBoard["children"],
    order: [...(board?.order ?? []), newViewId],
  });
  setActiveViewId(newViewId);
  updateViewInUrl(newViewId);
}
