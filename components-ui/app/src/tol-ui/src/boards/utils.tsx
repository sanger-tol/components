/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  API_METHODS,
  BOARD_ENTITIES,
  BOARD_ENTITY_HIERARCHY,
  BOARD_MESSAGE_TEXT,
  BOARDS_API,
  deepCopy,
  HTTP_STATUS_CODES,
  isEmptyObject,
  MESSAGE_TYPE,
  PopUpMessage,
  TsDataSource,
} from "..";
import type {
  IBoard,
  IComponent,
  IZone,
  TBoardChildren,
  TBoardEntity,
  TBoardEntityType,
  TChildBoardEntity,
  TParentBoardEntity,
} from "..";


/**
 * Returns the prefix for a given board entity type.
 *
 * @param objectType The type of the board entity (e.g. 'board').
 * @returns The prefix for the board entity type (e.g. 'b' for 'board').
 */
export function getEntityPrefix(objectType: string): string {
  return objectType[0];
}

/**
 * Derives the board object type from a board entity ID by inspecting its prefix.
 *
 * @param id The identifier of the board entity (e.g. 'b_123').
 * @returns The board object type string (e.g. 'board').
 * @throws If the prefix is not recognised.
 */
export function deriveBoardObjectType(id: string): TBoardEntityType {
  const prefix = id.split("_")[0];
  switch (prefix) {
    case "b":
      return BOARD_ENTITIES.ENTITIES.BOARD;
    case "v":
      return BOARD_ENTITIES.ENTITIES.VIEW;
    case "z":
      return BOARD_ENTITIES.ENTITIES.ZONE;
    case "c":
      return BOARD_ENTITIES.ENTITIES.COMPONENT;
    default:
      throw new Error(`Unknown board entity prefix: ${prefix}`);
  }
}

/**
 * Returns the next child entity type in the board hierarchy for a given parent type.
 *
 * @param parentObjectType The parent entity type.
 * @returns The next entity type in the hierarchy.
 * @throws If the parent type is unknown or has no child type.
 */
export function deriveBoardChildObjectType(parentObjectType: string): TBoardEntityType {
  const parentIndex = BOARD_ENTITY_HIERARCHY.indexOf(parentObjectType);
  if (parentIndex === -1 || parentIndex === BOARD_ENTITY_HIERARCHY.length - 1) {
    throw new Error(`Unknown parent object type: ${parentObjectType}`);
  }
  return BOARD_ENTITY_HIERARCHY[parentIndex + 1] as TBoardEntityType;
}

/**
 * Recursively defines all children of a parent board entity.
 *
 * @param entity The parent board entity whose children should be defined.
 * @param objectType The type of the parent board entity.
 * @returns A record containing all defined child entities.
 */
export function defineChildrenEntities(
  entity: Partial<TParentBoardEntity>,
  objectType: string
): Record<string, TChildBoardEntity> {
  return Object.entries(entity.children!).reduce(
    (acc, [childId, childEntity]) => {
      const childObjectType = deriveBoardChildObjectType(objectType);
      acc[childId] = defineBoardEntity(
        childEntity,
        childObjectType!,
      ) as TChildBoardEntity;
      return acc;
    },
    {} as TBoardChildren<TChildBoardEntity>,
  )
}

/**
 * Defines a board entity (view, zone, or component) by adding it to its parent entity and setting default
 * values for certain properties based on the entity type.
 *
 * @param entity The board entity to be defined (view, zone, or component).
 * @param objectType The type of the board entity (e.g. 'view', 'zone', 'component').
 * @returns The defined board entity with default values applied.
 */
export function defineBoardEntity(
  entity: Partial<TBoardEntity>,
  objectType: string,
): Partial<TBoardEntity> {
  if (
    objectType === BOARD_ENTITIES.ENTITIES.COMPONENT ||
    objectType === BOARD_ENTITIES.ENTITIES.ZONE
  ) {
    const definedEntity = entity as Partial<IZone> | Partial<IComponent>;
    const initialFilter = definedEntity.filter ?? { and_: {} };
    entity = {
      ...entity,
      filter: deepCopy(initialFilter),
      defaultFilter: deepCopy(initialFilter),
      title: definedEntity.title || "",
    };
  }

  // If the objectType is not component, we need to set up an empty object for the child board level
  // and an empty order array in the parent board entity
  if (objectType !== BOARD_ENTITIES.ENTITIES.COMPONENT) {
    const entityWithChildren = entity as Partial<TParentBoardEntity>;
    entity = {
      // Default order
      order: [],
      // Spread the entity, allowing order to be overridden if it was already set on the entity
      ...entity,
      // Recusively define children with the same function, ensuring all nested entities are fully defined
      children:
        isEmptyObject(entityWithChildren.children) ? {} : defineChildrenEntities(entityWithChildren, objectType),
    };
  }

  // Return the defined board entity with defaults and necessary properties for it to be added to the parent entity
  return entity;
}

/**
 * Defines a board entity (view, zone, or component) and adds it to its parent entity
 *
 * @param objectType The type of the board entity (e.g. 'view', 'zone', 'component').
 * @param entity The board entity to be defined (view, zone, or component).
 * @param parentEntity The parent entity (board, view, or zone) to which the new entity will be added.
 * @returns The updated parent entity with the new board entity added.
 */
export function defineBoardEntityInParent(
  objectType: string,
  entity: Partial<TChildBoardEntity>,
  parentEntity: TParentBoardEntity
): TParentBoardEntity {
  const definedEntity = defineBoardEntity(entity, objectType);
  parentEntity.children[entity.id!] = {
    ...definedEntity,
  } as TChildBoardEntity;
  parentEntity.order.push(entity.id!);
  return parentEntity;
}

/**
 * Removes a component, view, or zone from the board state and updates the order of the remaining elements accordingly.
 *
 * @param id The identifier of the component, view, or zone to be removed.
 * @param parentEntity The current state of the parent entity from which the child entity will be removed.
 */
export function removeBoardEntityInParent(id: string, parentEntity: TParentBoardEntity) {
  delete parentEntity.children[id];
  parentEntity.order = parentEntity.order.filter(
    (currentId) => currentId !== id,
  );
}

/**
 * Fetches a board entity and its children from the board data source.
 *
 * @param boardDataSource The data source used to perform the request.
 * @param parentId The identifier of the board entity to fetch.
 * @returns The board entity and its children.
 */
export async function fetchBoardEntityAndChildren(
  boardDataSource: TsDataSource,
  parentId: string,
): Promise<IBoard> {
  const entityType = deriveBoardObjectType(parentId);
  return await boardDataSource
    .custom({
      method: API_METHODS.GET,
      resource: `${BOARDS_API.OPERATIONS.GET}/${parentId}`,
    })
    .then((res: { data: IBoard }) => {
      return defineBoardEntity(res.data, entityType) as IBoard;
    })
    .catch(() => {
      PopUpMessage({
        type: MESSAGE_TYPE.ERROR,
        message: BOARD_MESSAGE_TEXT(entityType).FETCH.ERROR,
      });
      return {} as IBoard;
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
  childIds: string[],
) {
  const entityType = deriveBoardObjectType(parentId);
  return await boardDataSource
    .custom({
      method: API_METHODS.PATCH,
      resource: `${BOARDS_API.OPERATIONS.REORDER}/${parentId}`,
      body: { order: childIds },
    })
    .catch(({ response }) => {
      if (response.status === HTTP_STATUS_CODES.FORBIDDEN) {
        PopUpMessage({
          type: MESSAGE_TYPE.ERROR,
          message: BOARD_MESSAGE_TEXT(entityType).REORDER.FORBIDDEN,
        });
        return;
      }
      PopUpMessage({
        type: MESSAGE_TYPE.ERROR,
        message: BOARD_MESSAGE_TEXT(entityType).REORDER.ERROR,
      });
    });
}

/**
 * Updates an existing board entity by upserting a partial set of attributes.
 *
 * @param boardDataSource The data source used to perform the upsert request.
 * @param entityId The identifier of the board, view, zone, or component to update.
 * @param attributes A partial attributes object to persist on the target entity.
 * @returns The response returned by the data source upsert operation.
 */
export async function upsertBoardEntity(
  boardDataSource: TsDataSource,
  entityId: string,
  attributes: Record<string, any> = {},
) {
  const entityType = deriveBoardObjectType(entityId);
  return await boardDataSource.upsert({
    objectType: entityType,
    payload: [
      {
        type: entityType,
        id: entityId,
        attributes: attributes,
      },
    ],
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
  const entityType = deriveBoardObjectType(parentId);
  return await boardDataSource
    .custom({
      method: API_METHODS.POST,
      resource: `${BOARDS_API.OPERATIONS.ADD_NEW}/${parentId}`,
      body: { attributes: attributes },
    })
    .catch(({ response }) => {
      if (response.status === HTTP_STATUS_CODES.FORBIDDEN) {
        PopUpMessage({
          type: MESSAGE_TYPE.ERROR,
          message: BOARD_MESSAGE_TEXT(entityType).ADD.FORBIDDEN,
        });
        return;
      }
      PopUpMessage({
        type: MESSAGE_TYPE.ERROR,
        message: BOARD_MESSAGE_TEXT(entityType).ADD.ERROR,
      });
    });
}

/**
 * Updates the title of a board entity (board, view, zone or component) in the data source.
 * @param title The new title to be set.
 * @param id The identifier of the board entity.
 * @param boardDataSource The data source used for the upsert operation.
 */
export async function upsertTitle(
  title: string,
  id: string,
  boardDataSource: TsDataSource,
) {
  const objectType = deriveBoardObjectType(id);
  await upsertBoardEntity(boardDataSource, id, { title: title })
    .catch(() => {
      PopUpMessage({
        type: MESSAGE_TYPE.ERROR,
        message: BOARD_MESSAGE_TEXT(objectType).UPDATE.ERROR,
      });
    });
}

/**
 * Deletes a board entity from the data source by its identifier.
 *
 * @param boardDataSource The data source used to perform the delete request.
 * @param id The identifier of the board entity to delete.
 */
export async function deleteBoardEntity(
  boardDataSource: TsDataSource,
  id: string,
): Promise<string | void> {
  const entityType = deriveBoardObjectType(id);
  return await boardDataSource
    .custom({
      method: API_METHODS.DELETE,
      resource: `${BOARDS_API.OPERATIONS.DELETE}/${id}`,
    })
    .then(() => {
      PopUpMessage({
        type: MESSAGE_TYPE.SUCCESS,
        message: BOARD_MESSAGE_TEXT(entityType).DELETE.SUCCESS,
      });
      return "success";
    })
    .catch(({ response }) => {
      if (response.status === HTTP_STATUS_CODES.FORBIDDEN) {
        PopUpMessage({
          type: MESSAGE_TYPE.ERROR,
          message: BOARD_MESSAGE_TEXT(entityType).DELETE.FORBIDDEN,
        });
        return;
      }
      PopUpMessage({
        type: MESSAGE_TYPE.ERROR,
        message: BOARD_MESSAGE_TEXT(entityType).DELETE.ERROR,
      });
    });
}

/**
 * Deletes the board diff entry for a given component and user.
 * Since the entity_diff endpoint does not support DELETE, this upserts with config: null,
 * which causes getComponentData to skip the proxy and restore the original config.
 *
 * @param boardDataSource The data source used to query the board diff.
 * @param diffId The identifier of the board diff to be deleted.
 * @param userId The identifier of the user who owns the diff. If not provided, the function returns early.
 */
export async function deleteComponentDiff(
  boardDataSource: TsDataSource,
  diffId: string,
  userId?: string,
) {
  if (!userId) return;
  await boardDataSource
    .custom({
      method: API_METHODS.DELETE,
      resource: `${BOARD_ENTITIES.ENTITIES.ENTITY_DIFF}/${diffId}`,
    })
    .catch(() => {
      PopUpMessage({
        type: MESSAGE_TYPE.ERROR,
        message: BOARD_MESSAGE_TEXT(BOARD_ENTITIES.ENTITIES.COMPONENT).UPDATE
          .ERROR,
      });
    });
}
