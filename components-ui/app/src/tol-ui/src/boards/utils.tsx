/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  generateId,
  TsDataSource,
  BOARDS,
  IZone,
  IBoard,
  IView,
  IComponent,
  IDataObject,
  TDataObjectListOrNull,
  deepCopy,
  PopUpMessage,
  boardParams,
  User,
  IViews,
  normaliseCaps,
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
  TParent extends IBoard | IView | IZone
>(
  id: string,
  parentObjectType: string,
  parentBoardEntity: TParent,
) {
  delete parentBoardEntity[boardParams[parentObjectType].childrenKey][id];
  parentBoardEntity.order = parentBoardEntity?.order?.filter((currentId) => currentId !== id);
}

/**
 * Retrieves the ordered IDs of related board entities from a joining table.
 * 
 * @param dataObjects The list of data objects representing the joining table entries.
 * @param objectType The type of the related board entity (e.g., 'zone', 'view') to extract IDs for.
 * @returns An array of ordered IDs or undefined if the input is null.
 */
export function getOrderedIdsViaBoardJoiningEntity(dataObjects: TDataObjectListOrNull, objectType: string): string[] | undefined {
  return dataObjects
    // sort by order attribute in joining table (e.g. zone_view) to get the correct order of ids
    ?.sort((a, b) => a?.order - b?.order)
    .map((item) => {
      const relatedObj = item?.relationships?.[objectType] as IDataObject;
      return relatedObj.id;
    });
}

/**
 * Fetches board entities and its order based on the joining table entries (e.g. zone_views for zones in a view) and defines the entities using a provided function.
 * 
 * @param boardDataSource The data source instance to use for fetching board config data.
 * @param parentId The ID of the parent entity (e.g. the view id for zones).
 * @param parentObjectType The object type of the parent entity (e.g. 'view').
 * @param parentEntity The current board entity (e.g. View) to which the related entities belong.
 * @param dataObjectToChildParams A function that takes the core data object and its corresponding joining table entry to define a child entity.
 * @param dataObjectToParentParams A function that takes the parent data object to extract necessary parameters for defining the parent entity.
 * @returns A promise that resolves to the defined board entities along with their order.
 */
export async function getBoardEntity<
  TParent extends IBoard | IView | IZone,
  TChild extends IView | IZone | IComponent,
>(
  boardDataSource: TsDataSource,
  parentId: string,
  objectType: string,
  parentEntity: TParent,
  dataObjectToChildParams: (childDataObjects: IDataObject, joiningObject: IDataObject) => Partial<TChild>,
  dataObjectToParentParams?: (parentDataObject: IDataObject) => Partial<TParent>,
): Promise<TParent> {
  const {
    parentIdField,
    parentRelationship,
    joiningObjectType,
    childRelationship,
    childrenKey,
    joiningObjectRequestedFields
  } = boardParams[objectType];

  return await boardDataSource
    .getListPage({
      objectType: joiningObjectType,
      requestedFields: joiningObjectRequestedFields,
      filter: {
        and_: {
          [parentIdField]: { eq: { value: parentId } },
        },
      },
    })
    .then(async (joiningObjects: TDataObjectListOrNull) => {
      const parentDataObject = joiningObjects?.[0]?.relationships?.[parentRelationship] as IDataObject;
      const orderedIds = getOrderedIdsViaBoardJoiningEntity(joiningObjects, childRelationship);

      const definedBoardEntities = {};
      joiningObjects?.forEach((joiningObject) => {
        if (joiningObject) {
          // retrieve the core child object
          const obj = joiningObject?.relationships?.[childRelationship] as IDataObject;

          // define the board entity (e.g. zone) using the retrieved object and its corresponding joining table entry (e.g. zone_view)
          definedBoardEntities[obj.id] = dataObjectToChildParams(obj, joiningObject);
        }
      });

      // return the defined board entities in the correct order based on the joining table order
      return {
        ...parentEntity,
        ...dataObjectToParentParams?.(parentDataObject) || {},
        [childrenKey]: definedBoardEntities,
        order: orderedIds,
      } as TParent;
    })
    .catch((e: any) => {
      console.error(e);
      PopUpMessage({
        type: "error",
        message: `Error fetching ${parentRelationship} ${parentId}. Please refresh and try again.`,
      });
      throw e;
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
    const e = entity as IZone | IComponent;
    defaults = {
      filter: e.filter ? deepCopy(e.filter) : { and_: {} },
      defaultFilter: e.filter ? deepCopy(e.filter) : { and_: {} },
      title: e.title || "",
    }
  }

  // If the objectType is not component, we need to set up an empty object for the child board level
  // and an empty order array in the parent board entity
  if (objectType !== BOARDS.COMPONENT && childrenKey) {
    defaults = {
      [childrenKey]: {},
      order: [],
      ...defaults,
    }
  }

  // Return the defined board entity with defaults and necessary properties for it to be added to the parent entity
  return {
    ...defaults,
    ...entity
  }
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
 * Upserts a new board entity (board, view, zone, or component) into the data source with
 * default values for required properties and handles errors with a pop-up message.
 * 
 * @param objectType The type of the board entity (e.g. 'board', 'view', 'zone', 'component').
 * @param attributes The attributes of the board entity to be upserted.
 * @param boardDataSource The data source to upsert the board entity into.
 * @param id The ID of the board entity to be upserted (optional).
 * @returns Data object list containing the newly created board entity or null if the operation fails.
 */
async function upsertNewBoardEntity(
  objectType: string,
  attributes: object,
  boardDataSource: TsDataSource,
  id?: string,
) {
  return await boardDataSource
    .upsert({
      objectType: objectType,
      payload: [{
        ...(id && { id }),
        type: objectType,
        attributes: attributes,
      }],
      params: {
        merge_collections: false,
      },
    }).catch((e: any) => {
      console.error(e);
      PopUpMessage({
        type: "error",
        message: `Error creating ${objectType}. Please refresh and try again.`,
      });
      throw e;
    });
}

/**
 * Upserts a board entity (board, view, zone, or component) into the data source with
 * default values for required properties and handles errors with a pop-up message.
 * 
 * @param objectType The type of the board entity (e.g. 'board', 'view', 'zone', 'component').
 * @param attributes The attributes of the board entity to be upserted.
 * @param boardDataSource The data source to upsert the board entity into.
 * @param user The user performing the upsert operation.
 * @param id The ID of the board entity to be upserted (optional).
 * @returns Data object list containing the newly created board entity or null if the operation fails.
 */
export async function upsertCoreBoardEntity(
  objectType: string,
  attributes: object,
  boardDataSource: TsDataSource,
  user?: User,
  id?: string,
) {
  // Generate a new ID for the board entity based on its type (e.g. 'b' for board, 'v' for view, 'z' for zone, 'c' for component)
  const entityId = id || generateId(getEntityPrefix(objectType));

  // Add the user_id to the attributes for the upsert operation
  const upsertAttributes = {
    ...attributes,
    ...(user && { user_id: user.id }),
  };

  return await upsertNewBoardEntity(
    objectType,
    upsertAttributes,
    boardDataSource,
    entityId,
  );
}

/**
 * Joins two board entities together by upserting a joining table entry
 * 
 * @param objectType The type of the joining table entity (e.g. 'view_board' for joining views to boards).
 * @param attributes The attributes of the joining table entry to be upserted (e.g. order, board_id, view_id for a view_board entry).
 * @param boardDataSource The data source to upsert the joining table entry into.
 * @returns Data object list containing the newly created joining table entry or null if the operation fails.
 */
export async function upsertJoiningBoardEntity(
  objectType: string,
  attributes: object,
  boardDataSource: TsDataSource,
) {
  return await upsertNewBoardEntity(
    objectType,
    attributes,
    boardDataSource,
  );
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
