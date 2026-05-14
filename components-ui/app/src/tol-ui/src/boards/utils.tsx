/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  TsDataSource,
  BOARDS,
  IZone,
  IBoard,
  IView,
  IComponent,
  deepCopy,
  boardParams,
  normaliseCaps,
  BOARD_DIFF_API_PATH,
  API_UTILITY_OPERATIONS,
  API_METHODS,
  PopUpMessage,
  ERROR_FETCHING_BOARD_ENTITY,
} from "..";

/**
 * Updates the title of a board entity (board, view, zone or component) in the data source.
 * @param title The new title to be set.
 * @param id The identifier of the board entity.
 * @param boardDataSource The data source used for the upsert operation.
 * @param boardObjectType The type of the board entity (e.g. 'board', 'view', 'zone', 'component').
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
 * Removes a component, view, or zone from the board state and updates the order of the remaining elements accordingly.
 *
 * @param id The identifier of the component, view, or zone to be removed.
 * @param parentObjectType The type of the parent entity (e.g. 'board' for a view, 'view' for a zone, 'zone' for a component).
 * @param parentBoardEntity The current state of the parent entity from which the child entity will be removed.
 */
export function deleteBoardEntityInParent<
  TParent extends IBoard | IView | IZone,
>(id: string, parentObjectType: string, parentBoardEntity: TParent) {
  delete parentBoardEntity[boardParams[parentObjectType].childrenKey][id];
  parentBoardEntity.order = parentBoardEntity?.order?.filter(
    (currentId) => currentId !== id,
  );
}

/**
 * Fetches a board entity and its children from the board data source.
 *
 * @param boardDataSource The data source used to perform the request.
 * @param parentId The identifier of the board entity to fetch.
 * @param objectType The type of the board entity.
 * @returns The board entity and its children.
 */
export async function getBoardEntityAndChildren(
  boardDataSource: TsDataSource,
  parentId: string,
  objectType: "board" | "view" | "zone" | "component",
) {
  return await boardDataSource
    .custom({
      method: API_METHODS.GET,
      resource: `${API_UTILITY_OPERATIONS.GET_BOARD_ENTITY}/${objectType}/${parentId}`,
    })
    .then((res) => {
      return res.data;
    })
    .catch(() => {
      PopUpMessage({
        type: "error",
        message: ERROR_FETCHING_BOARD_ENTITY,
      });
    });
}

/**
 * Defines a board entity (view, zone, or component) by adding it to its parent entity and setting default
 * values for certain properties based on the entity type.
 *
 * @param entity The board entity to be defined (view, zone, or component).
 * @param objectType The type of the board entity (e.g. 'view', 'zone', 'component').
 * @param childrenKey The key to initialise the children for each entity type (e.g. 'zones' for a view, 'components' for a zone).
 */
export function defineBoardEntity<TEntity extends IView | IZone | IComponent>(
  entity: Partial<TEntity>,
  objectType: string,
) {
  // Get the children key if the objectType can have children
  const childrenKey = boardParams?.[objectType]?.childrenKey;
  // Add default values for filter and title if the entity is a zone or component
  let defaults = {};
  if (objectType === BOARDS.COMPONENT || objectType === BOARDS.ZONE) {
    const e = entity as Partial<IZone> | Partial<IComponent>;
    defaults = {
      filter: e.filter ? deepCopy(e.filter) : { and_: {} },
      defaultFilter: e.filter ? deepCopy(e.filter) : { and_: {} },
      title: e.title || "",
    };
  }

  // If the objectType is not component, we need to set up an empty object for the child board level
  // and an empty order array in the parent board entity
  if (objectType !== BOARDS.COMPONENT && childrenKey) {
    defaults = {
      [childrenKey]: {},
      order: [],
      ...defaults,
    };
  }

  // Return the defined board entity with defaults and necessary properties for it to be added to the parent entity
  return {
    ...defaults,
    ...entity,
  };
}

/**
 * Defines a board entity (view, zone, or component) and adds it to its parent entity
 *
 * @param entity The board entity to be defined (view, zone, or component).
 * @param objectType The type of the board entity (e.g. 'view', 'zone', 'component').
 * @param parentEntity The parent entity (board, view, or zone) to which the new entity will be added.
 * @param parentObjectType The type of the parent entity (e.g. 'board', 'view', 'zone').
 * @returns The updated parent entity with the new board entity added.
 */
export function defineBoardEntityInParent<
  TEntity extends IView | IZone | IComponent,
  TParent extends IBoard | IView | IZone,
>(
  entity: Partial<TEntity>,
  objectType: string,
  parentEntity: TParent,
  parentObjectType: string,
) {
  const definedEntity = defineBoardEntity(entity, objectType);
  const parentChildrenKey = boardParams?.[parentObjectType]?.childrenKey;
  parentEntity[parentChildrenKey][entity.id] = definedEntity;
  parentEntity.order.push(entity.id!);
  return parentEntity;
}

/**
 * Returns the prefix for a given board entity type.
 * @param objectType The type of the board entity (e.g. 'board', 'view', 'zone', 'component').
 * @returns The prefix for the board entity type.
 */
export function getEntityPrefix(objectType: string): string {
  return objectType[0];
}

/**
 * Creates a new title for a board entity (view, zone, or component) based on the existing titles.
 * @param parentEntity The parent entity (board, view, or zone) to which the new entity will be added.
 * @param parentObjectType The type of the parent entity (e.g. 'board', 'view', 'zone').
 * @param childObjectType The type of the child entity (e.g. 'view', 'zone', 'component').
 * @returns The new title for the child entity.
 */
export function getNextTitle<
  TParent extends IBoard | IView | IZone,
>(
  parentEntity: TParent,
  parentObjectType: string,
  childObjectType: string
): string {
  const titlePrefix = normaliseCaps(childObjectType);
  const titles = Object.values(parentEntity[boardParams[parentObjectType].childrenKey] as IViews).map(v => v.title || "")

  const regex = new RegExp(`^${titlePrefix} (\\d+)$`);
  const numbers = titles
    .map(title => title.match(regex))
    .filter(Boolean)
    .map(match => parseInt(match![1], 10));

  const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : titles.length + 1;

  return `${titlePrefix} ${nextNumber}`;
}

export async function deleteComponentDiff(
  componentId: string,
  boardDataSource: TsDataSource,
  userId?: string,
) {
  if (!userId) return;

  // The board_diff endpoint does not support DELETE, so we upsert with config: null.
  // getComponentData skips the proxy when diff.config is null, restoring the original config.
  const res = await boardDataSource.getListPage({
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
 * Patches the order of child entities within a parent board entity.
 *
 * @param boardDataSource The data source used to perform the patch operation.
 * @param parentId The identifier of the parent board entity whose children are being reordered.
 * @param childIds The new ordered list of child entity IDs.
 */
export async function patchReorderBoardEntity(
  boardDataSource: TsDataSource,
  parentId: string,
  childIds: string[]
) {
  await boardDataSource.custom({
    method: API_METHODS.PATCH,
    resource: `${API_UTILITY_OPERATIONS.BOARD_ENTITY_REORDER}/${parentId}`,
    body: { order: JSON.stringify(childIds) },
  });
}
