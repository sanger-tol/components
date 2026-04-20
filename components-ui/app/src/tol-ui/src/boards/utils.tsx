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
  BOARD_DIFF_API_PATH,
  PopUpMessage,
} from "..";

/**
 * Creates a board, creates its initial view, then links the view to the board.
 *
 * @param boardDataSource - Data source used for board API writes.
 * @param id - Optional board id; generated when not provided.
 * @param title - Board title.
 * @param viewId - Optional initial view id; generated when not provided.
 * @param viewTitle - Initial view title.
 */
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

/**
 * Creates or updates a view with an empty default filter for the current user.
 *
 * @param boardDataSource - Data source used for board API writes.
 * @param id - Optional view id; generated when not provided.
 * @param title - View title.
 */
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

/**
 * Updates the title for a board, view, zone, or component object.
 *
 * @param title - New title value.
 * @param id - Object id to update.
 * @param boardDataSource - Data source used for board API writes.
 * @param boardObjectType - Board API object type to update.
 */
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

/**
 * Creates or updates a zone record.
 *
 * @param boardDataSource - Data source used for board API writes.
 * @param zoneId - Zone id to create or update.
 * @param attributes - Zone attributes to persist.
 * @returns The API upsert response.
 */
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

/**
 * Persists component attributes either to the published component or to a user diff.
 *
 * In edit mode the component itself is updated. Outside edit mode, the attributes
 * are stored in `board_diff` for the supplied user so personal configuration does
 * not modify the published component.
 *
 * @param boardDataSource - Data source used for board API writes.
 * @param componentId - Component id to update.
 * @param attributes - Component or diff attributes to persist.
 * @param editMode - When true, update the published component instead of a diff.
 * @param userId - User id for `board_diff`.
 */
export async function upsertComponent(
  boardDataSource: TsDataSource,
  componentId: string,
  attributes: object,
  editMode?: boolean,
  userId?: string,
) {
  if (!editMode && !userId) return;
  const isConfigUpdate = Object.prototype.hasOwnProperty.call(attributes, "config");
  const onConfigSaved = () => {
    if (!isConfigUpdate) return;
    PopUpMessage({
      type: "success",
      message: "Configuration saved.",
    });
  };
  const onConfigSaveFailed = (err: any) => {
    if (isConfigUpdate) {
      PopUpMessage({
        type: "error",
        message: "Failed to save configuration.",
      });
    }
    throw err;
  };

  // use editMode to determine which call to make
  // if editMode is false, we need to get the 'id' of the record with the 'component' id then upsert the diff
  if (editMode) {
    return await boardDataSource
      .upsert({
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
      .then((res: any) => {
        onConfigSaved();
        return res;
      })
      .catch(onConfigSaveFailed);
  }

  return await boardDataSource
    .getList({
      objectType: BOARDS.BOARD_DIFF,
      filter: {
        and_: {
          component_id: { eq: { value: componentId } },
          user_id: { eq: { value: userId } },
        },
      },
      requestedFields: ["id"],
    })
    .then(async (res) => {
      const id = res?.[0]?.["id"];
      return await boardDataSource
        .upsert({
          objectType: BOARDS.BOARD_DIFF,
          payload: [
            {
              type: BOARDS.BOARD_DIFF,
              ...(id && { id: id }),
              attributes: {
                ...attributes,
                component_id: componentId,
                user_id: userId,
              },
            },
          ],
        })
        .then((res: any) => {
          onConfigSaved();
          return res;
        });
    })
    .catch(onConfigSaveFailed);
}

/**
 * Deletes the current user's component diff for a board component.
 *
 * @param componentId - Component id whose diff should be removed.
 * @param boardDataSource - Data source used to look up the diff record.
 * @param userId - User id for `board_diff`.
 */
export async function deleteComponentDiff(
  componentId: string,
  boardDataSource: TsDataSource,
  userId?: string,
) {
  if (!userId) return;

  // The board_diff endpoint does not support DELETE, so we upsert with config: null.
  // getComponentData skips the proxy when diff.config is null, restoring the original config.
  const res = await boardDataSource.getList({
    objectType: BOARDS.BOARD_DIFF,
    filter: {
      and_: {
        component_id: { eq: { value: componentId } },
        user_id: { eq: { value: userId } },
      },
    },
    requestedFields: ["id"],
  });
  const diffId = res?.[0]?.id;
  const localDataSource = new TsDataSource({ apiPath: BOARD_DIFF_API_PATH });
  if (diffId) {
    await localDataSource.deleteByID({
      objectType: BOARDS.BOARD_DIFF,
      id: diffId,
    });
  }
}

/**
 * Updates the in-memory zone component config and persists it.
 *
 * Published board edits are written to the component in edit mode. Personal
 * changes outside edit mode are written to `board_diff` and optionally mark the
 * component as having a diff.
 *
 * @param componentId - Component id whose config should be updated.
 * @param config - New component config.
 * @param zone - Zone object containing the in-memory component data.
 * @param boardDataSource - Data source used for board API writes.
 * @param editMode - When true, update the published component instead of a diff.
 * @param setHasDiff - Optional state setter used to show reset controls.
 * @param userId - User id for `board_diff`.
 * @returns The persistence request.
 */
export async function updateConfigAndUpsert(
  componentId: string,
  config: object,
  zone: IZone,
  boardDataSource: TsDataSource,
  editMode?: boolean,
  setHasDiff?: React.Dispatch<React.SetStateAction<boolean>>,
  userId?: string,
) {
  zone.components[componentId].data.config = config;
  const res = await upsertComponent(
    boardDataSource,
    componentId,
    { config: config },
    editMode,
    userId,
  );
  if (!editMode) {
    setHasDiff?.(true);
  }
  return res;
}
