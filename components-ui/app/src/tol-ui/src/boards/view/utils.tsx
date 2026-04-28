/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  BOARDS,
  IDataObject,
  IZone,
  TDataObjectListOrNull,
  defineBoardEntity,
  BOARD_CHILDREN_KEYS,
  TsDataSource,
  User,
  upsertCoreBoardEntity,
  upsertJoiningBoardEntity,
  IZoneIds,
} from "../..";


/**
 * Converts zone and zone-view data objects into zone parameters.
 * @param zoneDataObject The zone data object.
 * @param zoneViewDataObject The zone-view data object.
 * @returns A partial IZone object with the combined parameters.
 */
export function dataObjectsToZoneParams(zoneDataObject: IDataObject, zoneViewDataObject: IDataObject): Partial<IZone> {
  const dsi = zoneDataObject?.relationships?.data_source_instance as IDataObject;
  return defineBoardEntity<IZone>(
    {
      id: zoneDataObject.id,
      title: zoneDataObject.title,
      objectType: zoneDataObject.object_type,
      filter: zoneDataObject.filter,
      zoneViewId: zoneViewDataObject?.id,
      zoneViewOrder: zoneViewDataObject?.order,
      dataspace: new TsDataSource({
        dataSourceInstanceId: dsi?.id,
        ...dsi?.ui_api_details,
      }),
    },
    BOARDS.ZONE,
    BOARD_CHILDREN_KEYS.COMPONENTS
  );
}

/**
 * Creates a new zone and the corresponding zone-view joining entity, associating it with the specified view.
 * 
 * @param objectType The zone object type.
 * @param viewId The parent of the new zone.
 * @param nextOrderId The order ID for the new zone within the view.
 * @param dataSourceInstanceId The ID of the data source instance for the new zone.
 * @param boardDataSource The data source to use for creating the zone and zone-view.
 * @param user The user creating the zone and zone-view.
 * @returns An object containing the IDs of the newly created zone and zone-view entities.
 */
export async function createNewZone(
  objectType: string,
  viewId: string,
  nextOrderId: number,
  dataSourceInstanceId: string,
  boardDataSource: TsDataSource,
  user: User,
): Promise<IZoneIds | undefined> {
  const zoneObj = await upsertCoreBoardEntity(
    BOARDS.ZONE,
    {
      title: "",
      filter: { and_: {} },
      object_type: objectType,
      user_id: user.id,
      data_source_instance_id: dataSourceInstanceId,
    },
    boardDataSource,
    user
  );
  const zoneId = zoneObj?.[0]?.id;

  const zoneView = await upsertJoiningBoardEntity(
    BOARDS.ZONE_VIEW,
    {
      order: nextOrderId,
      view_id: viewId,
      zone_id: zoneId!,
    },
    boardDataSource,
  );
  const zoneViewId = zoneView?.[0]?.id;

  return {
    zoneId: zoneId!,
    zoneViewId: zoneViewId!,
  };
}

/**
 * Fetches the list of published dataspaces (data source instances with ui_api_details) from the board data source.
 * @param boardDataSource The data source to query for published dataspaces.
 * @returns A list of published dataspaces or null if none are found.
 */
export async function getPublishedDataspaces(
  boardDataSource: TsDataSource,
): Promise<TDataObjectListOrNull> {
  return await boardDataSource
    .getListPage({
      objectType: BOARDS.DATA_SOURCE_INSTANCE,
      pageSize: 100,
      filter: {
        and_: {
          ui_api_details: {
            exists: {}
          },
        },
      }
    })
    .then((data: TDataObjectListOrNull) => {
      return data;
    });
};
