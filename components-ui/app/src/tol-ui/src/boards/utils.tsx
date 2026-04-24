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
  TChildrenKey,
  IComponent,
  TBoardEntityOrder,
  IDataObject,
  TDataObjectListOrNull,
  IZones,
  deepCopy,
  PopUpMessage,
  boardFetchParams
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
 * Removes a component, view, or zone from the board state and updates the order of the remaining elements accordingly.
 * 
 * @param id The identifier of the component, view, or zone to be removed.
 * @param boardEntity The current state of the board entity (IBoard, IView, or IZone) from which the element will be removed.
 * @param boardLevel The level of the board entity (e.g., 'zones' for a zone, 'views' for a view) to identify which collection to update.
 */
export function deleteBoardEntity<
  TEntity extends IBoard | IView | IZone
>(
  boardLevel: TChildrenKey,
  id: string,
  boardEntity: TEntity,
) {
  delete boardEntity[boardLevel][id];
  boardEntity.order = boardEntity?.order?.filter((currentId) => currentId !== id);
}

/**
 * Reorders a component, view, or zone within the board state by a specified change in order.
 * 
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

/**
 * Retrieves the ordered IDs of related board entities from a joining table.
 * 
 * @param obj The list of data objects representing the joining table entries.
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
  parentObjectType: string,
  parentEntity: TParent,
  dataObjectToChildParams: (childDataObjects: IDataObject, joiningObject: IDataObject) => Partial<TChild>,
  dataObjectToParentParams?: (parentDataObject: IDataObject) => Partial<TParent>,
): Promise<TParent> {
  const {
    parentIdField,
    parentRelationship,
    childRelationship,
    joiningObjectType,
    childrenKey,
    joiningObjectRequestedFields
  } = boardFetchParams[parentObjectType];

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
  childrenKey?: TChildrenKey,
) {
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
      ...defaults,
      [childrenKey]: {},
      order: [],
    }
  }

  // Return the defined board entity with defaults and necessary properties for it to be added to the parent entity
  return {
    ...entity,
    ...defaults,
  }
}

/**
 * Defines a board entity (view, zone, or component) and adds it to its parent entity
 * 
 * @param entity The board entity to be defined (view, zone, or component).
 * @param objectType The type of the board entity (e.g. 'view', 'zone', 'component').
 * @param parentEntity The parent entity (board, view, or zone) to which the new entity will be added.
 * @param childrenKey The key in the parent entity where the child entities are stored (e.g. 'views' for a view, 'zones' for a zone).
 * @returns The updated parent entity with the new board entity added.
 */
export function defineBoardEntityInParent<
  TEntity extends IView | IZone | IComponent,
  TParentEntity extends IBoard | IView | IZone,
>(
  entity: TEntity,
  objectType: string,
  parentEntity: TParentEntity,
  childrenKey: TChildrenKey,
) {
  const definedEntity = defineBoardEntity(entity, objectType, childrenKey);
  parentEntity[childrenKey][entity.id] = definedEntity;
  parentEntity.order.push(entity.id!);
  return parentEntity;
}
