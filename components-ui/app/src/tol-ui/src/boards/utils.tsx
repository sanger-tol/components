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
  IComponent
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
            filter: { and_: {} },
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
export function useBoardState<TParent extends IBoard | IView | IZone, TChildren extends IView | IZone | IComponent>(
  boardLevel: TBoardLevel,
  id: string,
  parentStateValue: TParent,
  setParentStateValue: (newValue: TParent) => void,
  initialSetup?: TChildren
): [TChildren, (newValue: TChildren) => void] {
  const buildValue = (entry: TChildren) => ({
    ...parentStateValue,
    [boardLevel]: { ...parentStateValue[boardLevel], [id]: entry },
    order: [...(parentStateValue.order ?? []), id],
  }) as TParent;

  if (initialSetup && parentStateValue[boardLevel][id] == undefined) {
    setParentStateValue(buildValue(initialSetup));
  }

  const value = parentStateValue[boardLevel][id] as TChildren;
  const setValue = (newValue: TChildren) => setParentStateValue(buildValue(newValue));

  return [value, setValue];
}
