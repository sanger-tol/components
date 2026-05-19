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
  ERROR_UPDATING_TITLE,
  ERROR_ADDING_BOARD_ENTITY,
  ERROR_REORDERING_BOARD_ENTITY,
} from "..";

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
 * Defines a board entity (view, zone, or component) by adding it to its parent entity and setting default
 * values for certain properties based on the entity type.
 *
 * @param entity The board entity to be defined (view, zone, or component).
 * @param objectType The type of the board entity (e.g. 'view', 'zone', 'component').
 */
export function defineBoardEntity<TEntity extends IView | IZone | IComponent>(
  entity: Partial<TEntity>,
  objectType: string,
): Partial<TEntity> {
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
  if (objectType !== BOARDS.COMPONENT) {
    defaults = {
      children: {},
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
 * @returns The updated parent entity with the new board entity added.
 */
export function defineBoardEntityInParent<
  TEntity extends IView | IZone | IComponent,
  TParent extends IBoard | IView | IZone,
>(
  entity: Partial<TEntity>,
  objectType: string,
  parentEntity: TParent,
) {
  const definedEntity = defineBoardEntity(entity, objectType);
  const tempOrderOverride = objectType !== BOARDS.COMPONENT ? { order: [] } : {}; // TODO: backend to support
  parentEntity.children[entity.id!] = { ...definedEntity, ...tempOrderOverride } as unknown as TEntity;
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
  const titles = Object.values(parentEntity[boardParams[parentObjectType].childrenKey] as Record<string, IView | IZone | IComponent>).map(v => v.title || "")

  const regex = new RegExp(`^${titlePrefix} (\\d+)$`);
  const numbers = titles
    .map(title => title.match(regex))
    .filter(Boolean)
    .map(match => parseInt(match![1], 10));

  const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : titles.length + 1;

  return `${titlePrefix} ${nextNumber}`;
}

/**
 * Deletes the board diff entry for a given component and user.
 * Since the board_diff endpoint does not support DELETE, this upserts with config: null,
 * which causes getComponentData to skip the proxy and restore the original config.
 *
 * @param componentId The identifier of the component whose diff should be deleted.
 * @param boardDataSource The data source used to query the board diff.
 * @param userId The identifier of the user who owns the diff. If not provided, the function returns early.
 */
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

const parseOrder = (order: unknown): string[] => {
  if (Array.isArray(order)) return order;
  if (typeof order === "string") {
    try { return JSON.parse(order); } catch { return []; }
  }
  return [];
};

const normaliseEntity = (entity: any): any => {
  if (!entity || typeof entity !== "object") return entity;
  const normalised = { ...entity, order: parseOrder(entity.order) };
  if (normalised.children && typeof normalised.children === "object") {
    normalised.children = Object.fromEntries(
      Object.entries(normalised.children).map(([k, v]) => [k, normaliseEntity(v)])
    );
  }
  return normalised;
};

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
) {
  return await boardDataSource
    .custom({
      method: API_METHODS.GET,
      resource: `${API_UTILITY_OPERATIONS.GET_BOARD_ENTITY}/${parentId}`,
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
  return await boardDataSource
    .custom({
      method: API_METHODS.PATCH,
      resource: `${API_UTILITY_OPERATIONS.BOARD_ENTITY_REORDER}/${parentId}`,
      body: { order: childIds },
    })
    .catch(() => {
      PopUpMessage({
        type: "error",
        message: ERROR_REORDERING_BOARD_ENTITY,
      });
    });
}

/**
 * Posts a request to add a new board entity as a child of the given parent.
 *
 * @param boardDataSource The data source used to perform the request.
 * @param parentId The identifier of the parent entity to which the new entity will be added.
 * @param attributes Additional attributes to be set on the new entity.
 */
export async function postAddBoardEntity(
  boardDataSource: TsDataSource,
  parentId: string,
  attributes: Record<string, any> = {},
) {
  return await boardDataSource
    .custom({
      method: API_METHODS.POST,
      resource: `${API_UTILITY_OPERATIONS.ADD_BOARD_ENTITY}/${parentId}`,
      body: { attributes: attributes },
    })
    .catch(() => {
      PopUpMessage({
        type: "error",
        message: ERROR_ADDING_BOARD_ENTITY,
      });
    });
}

/**
 * Updates the title of a board entity (board, view, zone or component) in the data source.
 * @param title The new title to be set.
 * @param id The identifier of the board entity.
 * @param boardDataSource The data source used for the upsert operation.
 * @param boardObjectType The type of the board entity (e.g. 'board', 'view', 'zone', 'component').
 */
export function upsertTitle(
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
  })
    .catch(() => {
      PopUpMessage({
        type: "error",
        message: ERROR_UPDATING_TITLE,
      });
    });
}
