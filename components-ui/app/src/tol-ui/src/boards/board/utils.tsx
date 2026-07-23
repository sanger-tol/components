/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  BOARD_ENTITIES,
  BOARDS_API,
  API_METHODS,
  HTTP_STATUS_CODES,
  MESSAGE_TYPE,
  PopUpMessage,
  BOARD_MESSAGE_TEXT,
  upsertTitle,
  postAddBoardEntity,
  defineBoardEntityInParent,
  defineBoardEntity,
} from "../..";
import type {
  TsDataSource,
  IBoard,
  IView,
  TBoardChildren,
  TBoardEntityType,
  IZone,
} from "../..";

/**
 * Copies a board entity (e.g. board or view) by calling the API copy operation.
 * Displays a success or error pop-up message depending on the result.
 *
 * @param boardDataSource - The data source used to make API calls.
 * @param entityId - The ID of the entity to copy.
 * @param operation - The API operation path (e.g. `/copy`).
 * @param title - The title for the newly created copy.
 * @param copyEntityType - The board entity type being copied, used for message text.
 * @param parentEntityId - Optional ID of the parent entity to copy into.
 * @returns The newly created entity, or `undefined` if the operation failed.
 */
export async function copyBoardEntity<T>(
  boardDataSource: TsDataSource,
  entityId: string,
  operation: string,
  title: string = undefined!,
  copyEntityType: TBoardEntityType,
  parentEntityId?: string,
): Promise<T | undefined> {
  return (await boardDataSource
    .custom({
      method: API_METHODS.POST,
      resource: `${operation}/${entityId}`,
      body: {
        ...(title ? { new_parent_entity_title: title } : {}),
        ...(parentEntityId ? { parent_entity_id: parentEntityId } : {}),
      },
    })
    .then((res: { status: number; data: T }) => {
      if (res.status === HTTP_STATUS_CODES.CREATED) {
        PopUpMessage({
          type: MESSAGE_TYPE.SUCCESS,
          message: BOARD_MESSAGE_TEXT(copyEntityType).BOARD_COPY.IMPORT_SUCCESS,
        });
        return res.data;
      }
    })
    .catch(({ response }) => {
      if (response?.status === HTTP_STATUS_CODES.FORBIDDEN) {
        PopUpMessage({
          type: MESSAGE_TYPE.ERROR,
          message:
            BOARD_MESSAGE_TEXT(copyEntityType).BOARD_COPY.IMPORT_FORBIDDEN,
        });
        return undefined;
      }
      PopUpMessage({
        type: MESSAGE_TYPE.ERROR,
        message: BOARD_MESSAGE_TEXT(copyEntityType).BOARD_COPY.IMPORT_ERROR,
      });
      return undefined;
    })) as Promise<T>;
}

/**
 * Replaces the current browser URL state with the given board and view IDs.
 *
 * @param boardId - The ID of the board to reflect in the URL.
 * @param viewId - The ID of the view to reflect in the URL.
 */
export function replaceURLState(boardId: string, viewId: string) {
  window.history.replaceState(
    null,
    "",
    `/${BOARD_ENTITIES.ENTITIES.BOARD}/${boardId}?${BOARD_ENTITIES.ENTITIES.VIEW}=${viewId}`,
  );
}

/**
 * Copies an entire board and navigates the URL to the first view of the new board.
 *
 * @param boardDataSource - The data source used to make API calls.
 * @param entityId - The ID of the board to copy.
 * @param title - The title for the newly created board copy.
 * @param copyEntityType - The board entity type, used for message text.
 * @returns The newly created `IBoard`, or `undefined` if the operation failed.
 */
export async function copyBoard(
  boardDataSource: TsDataSource,
  entityId: string,
  title: string,
  copyEntityType: TBoardEntityType,
): Promise<IBoard | undefined> {
  return await copyBoardEntity<IBoard>(
    boardDataSource,
    entityId,
    BOARDS_API.OPERATIONS.COPY,
    title,
    copyEntityType,
  ).then((newBoard: IBoard | undefined) => {
    if (!newBoard) return;
    const boardId = newBoard.id;
    const firstViewId = Object.keys(newBoard.children ?? {})[0];
    replaceURLState(boardId!, firstViewId!);
    return defineBoardEntity(newBoard, BOARD_ENTITIES.ENTITIES.BOARD) as IBoard;
  });
}

/**
 * Copies a view into a board and updates the URL to the new view.
 *
 * @param boardDataSource - The data source used to make API calls.
 * @param entityId - The ID of the view to copy.
 * @param copyEntityType - The board entity type, used for message text.
 * @param currentBoard - The current board state to merge the new view into.
 * @param parentEntityId - Optional ID of the parent entity to copy the view into.
 * @returns An object containing the new `IView` and the updated `IBoard`, or `undefined` if the operation failed.
 */
export async function copyView(
  boardDataSource: TsDataSource,
  entityId: string,
  copyEntityType: TBoardEntityType,
  currentBoard?: IBoard,
  parentEntityId?: string,
): Promise<{ view: IView; updatedBoard: IBoard } | undefined> {
  return await copyBoardEntity<IView>(
    boardDataSource,
    entityId,
    BOARDS_API.OPERATIONS.COPY,
    undefined,
    copyEntityType,
    parentEntityId,
  ).then((newView: IView | undefined) => {
    if (!newView || !currentBoard) return;
    replaceURLState(currentBoard.id!, newView.id!);
    const updatedBoard = defineBoardEntityInParent(
      BOARD_ENTITIES.ENTITIES.VIEW,
      newView,
      currentBoard,
    ) as IBoard;
    return { view: newView, updatedBoard };
  });
}

/**
 * Saves a new title for a view, persisting it via the API and returning an updated board state.
 * Returns `undefined` if the title is unchanged.
 *
 * @param newTitle - The new title string.
 * @param viewId - The ID of the view whose title is being updated.
 * @param board - The current board state containing the view.
 * @param boardDataSource - The data source used to make API calls.
 * @returns An updated `IBoard` with the new view title, or `undefined` if the title was unchanged.
 */
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

/**
 * Updates the `view` query parameter in the current URL without triggering a navigation.
 *
 * @param viewId - The ID of the view to set in the URL.
 */
export function updateViewInUrl(viewId: string) {
  const params = new URLSearchParams(location.search);
  params.set("view", viewId);
  window.history.replaceState(null, "", `?${params.toString()}`);
}

/**
 * Creates a new view on the given board via the API, updates the URL to the new view,
 * and returns the updated board state with the new view included.
 *
 * @param boardDataSource - The data source used to make API calls.
 * @param board - The current board to add the new view to.
 * @returns The updated board state with the new view, or `undefined` if the board has no ID.
 */
export async function onAddView(boardDataSource: TsDataSource, board: IBoard) {
  if (!board.id) return;
  return postAddBoardEntity(boardDataSource, board.id!).then((res) => {
    const view = res.data;
    updateViewInUrl(view.id);
    return defineBoardEntityInParent(
      BOARD_ENTITIES.ENTITIES.VIEW,
      view,
      board,
    );
  });
}
