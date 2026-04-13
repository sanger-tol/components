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
  title: string = "View 1",
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
  return await boardDataSource.upsert({
    objectType: BOARDS.ZONE,
    payload: [
      {
        type: BOARDS.ZONE,
        id: zoneId,
        attributes: attributes,
      },
    ],
  });
}

export async function upsertComponent(
  boardDataSource: TsDataSource,
  componentId: string,
  attributes: object,
  editMode?: boolean,
) {
  // use editMode to determine which call to make
  // if editMode is false, we need to get the 'id' of the record with the 'component' id then upsert the diff
  editMode
    ? await boardDataSource.upsert({
        objectType: BOARDS.COMPONENT,
        payload: [
          {
            type: BOARDS.COMPONENT,
            id: componentId,
            attributes: attributes,
          },
        ],
        params: {
          merge_collections: false,
        },
      })
    : await boardDataSource
        .getList({
          objectType: BOARDS.BOARD_DIFF,
          filter: {
            and_: {
              component_id: { eq: { value: componentId } },
              user_id: { eq: { value: getUserFromLocalStorage()?.id } },
            },
          },
          requestedFields: ["id"],
        })
        .then(async (res) => {
          const id = res?.[0]?.id;
          await boardDataSource.upsert({
            objectType: BOARDS.BOARD_DIFF,
            payload: [
              {
                type: BOARDS.BOARD_DIFF,
                ...(id && { id: id }),
                attributes: {
                  ...attributes,
                  component_id: componentId,
                  user_id: getUserFromLocalStorage()?.id,
                },
              },
            ],
          });
        });
}

export async function deleteComponentDiff(
  componentId: string,
  boardDataSource: TsDataSource,
) {
  // The board_diff endpoint does not support DELETE, so we upsert with config: null.
  // getComponentData skips the proxy when diff.config is null, restoring the original config.
  const res = await boardDataSource.getList({
    objectType: BOARDS.BOARD_DIFF,
    filter: {
      and_: {
        component_id: { eq: { value: componentId } },
        user_id: { eq: { value: getUserFromLocalStorage()?.id } },
      },
    },
    requestedFields: ["id"],
  });
  const diffId = res?.[0]?.id;
  if (diffId) {
    await boardDataSource.upsert({
      objectType: BOARDS.BOARD_DIFF,
      payload: [
        {
          type: BOARDS.BOARD_DIFF,
          id: diffId,
          attributes: {
            config: null,
            component_id: componentId,
            user_id: getUserFromLocalStorage()?.id,
          },
        },
      ],
    });
  }
}

export async function updateConfigAndUpsert(
  componentId: string,
  config: object,
  zone: IZone,
  boardDataSource: TsDataSource,
  editMode?: boolean,
) {
  zone.components[componentId].data.config = config;
  return await upsertComponent(
    boardDataSource,
    componentId,
    { config: config },
    editMode,
  );
}
