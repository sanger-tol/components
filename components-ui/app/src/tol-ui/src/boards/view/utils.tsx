/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  BOARDS,
  generateId,
  getUserFromLocalStorage,
  IDataObject,
  IZone,
  TDataObjectListOrNull,
  defineBoardEntity,
  BOARD_CHILDREN_KEYS,
  TsDataSource,
} from "../..";


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

// export async function upsertZoneOrder(
//   zoneId: string,
//   direction: TZoneReorderDirection,
//   view: IView,
//   boardDataSource: TsDataSource
// ) {

//   // Sort again
//   updatedZoneOrder.sort((a, b) => a.order - b.order);

//   // Get the maximum order value
//   const orders = updatedZoneOrder.map((zone) => {
//     return zone.order;
//   });
//   const maxOrder = Math.max(...orders);

//   // Add the max offset value to each zone order (This avoids integrity issues in the DB)
//   updatedZoneOrder.forEach((zone) => {
//     zone.order += maxOrder + 1;
//   });

//   const data = updatedZoneOrder.map((zone) => ({
//     type: BOARDS.ZONE_VIEW as string,
//     id: zone.zoneViewId,
//     attributes: {
//       order: zone.order,
//     },
//   }));

//   await boardDataSource.upsert({
//     objectType: BOARDS.ZONE_VIEW,
//     payload: data,
//   })

//   return Promise.resolve(view);
// };

export async function upsertNewZone(
  boardDataSource: TsDataSource,
  objectType: string,
  title: string,
  nextOrder: number,
  viewId: string,
  dataSourceInstanceId: string,
) {
  const user = getUserFromLocalStorage();
  const newId = generateId("z");
  await boardDataSource
    .upsert({
      objectType: BOARDS.ZONE,
      payload: [
        {
          type: BOARDS.ZONE,
          id: newId,
          attributes: {
            title: title,
            filter: { and_: {} },
            object_type: objectType,
            user_id: user.id,
            data_source_instance_id: dataSourceInstanceId,
          },
        },
      ],
    });

  return await boardDataSource
    .upsert({
      objectType: BOARDS.ZONE_VIEW,
      payload: [
        {
          type: BOARDS.ZONE_VIEW,
          attributes: {
            order: nextOrder,
            zone_id: newId,
            view_id: viewId,
          },
        },
      ],
    })
    .then((res) => {
      if (res && res[0]) {
        return {
          newZoneId: newId,
          newZoneViewId: res[0].id,
        };
      }
      throw new Error("Unexpected null response for Zone View creation");
    });
}

export async function fetchPublishedDataspaces(
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
