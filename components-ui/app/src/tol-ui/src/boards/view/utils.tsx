/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  BOARDS,
  generateId,
  getUserFromLocalStorage,
  IDataObject,
  IView,
  IZone,
  TDataObjectListOrNull,
  TDataObjectOrNull,
  TsDataSource,
} from "../..";


// export function getSortedZones(zoneOrder: IDBZoneView[]): string[] {
//   return zoneOrder.sort((a, b) => a.order - b.order).map((z) => z.zoneId);
// };

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

export async function getZones(viewId: string, boardDataSource: TsDataSource): Promise<IView> {
  return await boardDataSource
    .getListPage({
      objectType: BOARDS.ZONE_VIEW,
      filter: {
        and_: {
          view_id: { eq: { value: viewId } },
        },
      },
    })
    .then(async (zoneView: TDataObjectListOrNull) => {
      return await getZoneData(zoneView, boardDataSource) as unknown as Promise<IView>;
    });
}

async function getZoneData(zoneView: TDataObjectListOrNull, boardDataSource: TsDataSource): Promise<IView> {
  const ids = zoneView
    ?.sort((a, b) => a?.order - b?.order)
    .map((z) => {
      const zone = z?.relationships?.zone as IDataObject;
      return zone.id;
    });

  return await boardDataSource
    .getListPage({
      objectType: BOARDS.ZONE,
      filter: {
        and_: {
          id: { in_list: { value: ids } },
        },
      },
      requestedFields: ["data_source_instance.ui_api_details"]
    })
    .then((zones: TDataObjectListOrNull) => {
      return {
        zones: {}, //TODO: add zones with zone_view id etc
        order: ids,
      } as IView;
    });
}

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
