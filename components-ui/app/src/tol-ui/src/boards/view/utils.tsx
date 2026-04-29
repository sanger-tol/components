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
  TsDataSource,
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
    BOARDS.ZONE
  );
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
