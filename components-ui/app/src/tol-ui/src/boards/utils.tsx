/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  generateId,
  getUserFromLocalStorage,
  TsDataSource,
  BOARDS,
  IZone,
  IBoard,
  IView,
  TBoardLevel,
  IComponent,
  TZoneReorderDirection,
  TBoardEntityOrder
} from "..";


export async function createBoardAndView(
  boardDataSource: TsDataSource,
  id: string,
  title: string,
  viewId: string,
  viewTitle: string,
) {
  const user = getUserFromLocalStorage();
  const boardId = id ?? generateId("b");
  await boardDataSource
    .upsert({
      objectType: BOARDS.BOARD,
      payload: [
        {
          type: BOARDS.BOARD,
          id: boardId,
          attributes: {
            title: title,
            user_id: user.id,
          },
        },
      ],
    })
    .then(async () => {
      return upsertNewView(boardDataSource, viewId, viewTitle);
    })
    .then(async () => {
      await boardDataSource
        .upsert({
          objectType: BOARDS.VIEW_BOARD,
          payload: [
            {
              type: BOARDS.VIEW_BOARD,
              attributes: {
                order: 1,
                board_id: boardId,
                view_id: viewId,
              },
            },
          ],
        })
        .catch((err: any) => {
          console.error(err);
        });
    });
}

export async function upsertNewView(
  boardDataSource: TsDataSource,
  id: string,
  title: string = "View 1"
) {
  const user = getUserFromLocalStorage();
  const viewId = id ?? generateId("v");
  await boardDataSource
    .upsert({
      objectType: BOARDS.VIEW,
      payload: [
        {
          type: BOARDS.VIEW,
          id: viewId,
          attributes: {
            title: title,
            filter: { and_: {} },
            user_id: user.id,
          },
        },
      ],
    })
    .catch((err: any) => {
      console.error(err);
    });
}

export function saveTitle(
  title: string,
  id: string,
  boardDataSource: TsDataSource,
  boardObjectType: string,
) {
  boardDataSource.upsert({
    objectType: boardObjectType,
    payload: [
      {
        type: boardObjectType,
        id: id,
        attributes: {
          title: title,
        },
      },
    ],
  });
}

export async function upsertZone(
  boardDataSource: TsDataSource,
  zoneId: string,
  attributes: object,
) {
  return await boardDataSource
    .upsert({
      objectType: BOARDS.ZONE,
      payload: [
        {
          type: BOARDS.ZONE,
          id: zoneId,
          attributes: attributes
        },
      ],
    });
}

export async function upsertComponent(
  boardDataSource: TsDataSource,
  componentId: string,
  attributes: object,
) {
  return await boardDataSource
    .upsert({
      objectType: BOARDS.COMPONENT,
      payload: [
        {
          type: BOARDS.COMPONENT,
          id: componentId,
          attributes: attributes
        },
      ],
      params: {
        merge_collections: false,
      },
    });
}

export async function updateConfigAndUpsert(
  componentId: string,
  config: object,
  zone: IZone,
  boardDataSource: TsDataSource,
) {
  if (zone.components) zone.components[componentId].data.config = config;
  return await upsertComponent(
    boardDataSource,
    componentId,
    { config: config }
  );
}

/**
 * Custom hook for managing board state at different levels (board, view, zone). It initializes state if not already set and provides a setter function to update the state.
 * 
 * @param boardLevel - The level of the board to manage (e.g zone will be 'zones' so it can see its siblings).
 * @param id - The ID of the board element to manage.
 * @param parentStateValue - The current state of the board (IBoard, IView, or IZone).
 * @param setParentStateValue - The setter function to update the board state.
 * @param initialSetup - Optional initial setup for the board element if it doesn't already exist in the state.
 * 
 * @returns A tuple containing the current value of the board element and a setter function to update it.
 */
export function useBoardState<
  TParent extends IBoard | IView | IZone,
  TChildren extends IView | IZone | IComponent
>(
  boardLevel: TBoardLevel,
  id: string,
  parentStateValue: TParent,
  setParentStateValue: (newValue: TParent) => void,
): [TChildren, (newValue: TChildren) => void] {
  const value = parentStateValue[boardLevel][id] as TChildren;
  const setValue = (newValue: TChildren) => setParentStateValue({
    ...parentStateValue,
    [boardLevel]: {
      ...parentStateValue[boardLevel],
      [id]: newValue
    },
  } as TParent);

  return [value, setValue];
}

/**
 * Removes a component, view, or zone from the board state and updates the order of the remaining elements accordingly.
 * 
 * @param id The identifier of the component, view, or zone to be removed.
 * @param boardEntity The current state of the board entity (IBoard, IView, or IZone) from which the element will be removed.
 * @param boardLevel The level of the board entity (e.g., 'zones' for a zone, 'views' for a view) to identify which collection to update.
 */
export function deleteBoardEntity<
  TParent extends IBoard | IView | IZone
>(
  boardLevel: TBoardLevel,
  id: string,
  boardEntity: TParent,
) {
  delete boardEntity[boardLevel][id];
  boardEntity.order = boardEntity.order.filter((currentId) => currentId !== id);
}

/**
 * Reorders a component, view, or zone within the board state by a specified change in order.
 * @param id The identifier of the component, view, or zone to be reordered.
 * @param order The current order array
 * @param orderChange The number of positions to move the element (positive for down, negative for up).
 * @returns void
 */
export function reorderBoardEntityItem(
  id: string,
  order: TBoardEntityOrder,
  orderChange: number,
) {
  // Create a copy of the current order to modify
  const newOrder = [...order];

  // Find the current index of the element to be moved
  const currentIndex = newOrder.findIndex((currentId) => currentId === id);

  // Calculate the new index based on the order change
  const newIndex = currentIndex + orderChange;

  // Bounds check
  if (newIndex < 0 || newIndex >= newOrder.length) return order;

  // Remove from current position, insert at new position
  const [moved] = newOrder.splice(currentIndex, 1);
  newOrder.splice(newIndex, 0, moved);

  return newOrder;
}
