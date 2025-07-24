/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  BOARDS,
  generateId,
  getUserFromLocalStorage,
  IDBZone,
  IDBZoneView,
  TDataObjectListOrNull,
  TsDataSource
} from "../..";


export function getSortedZones(zones: IDBZone[], zoneOrder: IDBZoneView[]) {
  return [...zones].sort((a, b) => {
    const orderA = zoneOrder.find((zone) => zone.zoneId === a.id)?.order || 0;
    const orderB = zoneOrder.find((zone) => zone.zoneId === b.id)?.order || 0;
    return orderA - orderB;
  });
};

export async function reorderZoneAndUpsert(
  id: string,
  direction: string,
  zones: IDBZone[],
  zoneOrder: IDBZoneView[],
  boardDataSource: TsDataSource
) {
  // Sort a copy of zoneOrder array by order
  const updatedZoneOrder = [...zoneOrder];
  updatedZoneOrder.sort((a, b) => a.order - b.order);

  // Find the index of the zone order to move
  const moverIndex = updatedZoneOrder.findIndex((zone) => zone.zoneId === id);

  const delta = direction === "up" ? -1 : 1;

  // Find the zone order to move and the zone order to move it to
  const mover = updatedZoneOrder[moverIndex];
  const moved = updatedZoneOrder[moverIndex + delta];

  // Bounds check
  if (!moved) return;

  // Swap the order values
  const oldMoverOrder = mover.order;
  const oldMovedOrder = moved.order;

  mover.order = oldMovedOrder;
  moved.order = oldMoverOrder;

  // Sort again
  updatedZoneOrder.sort((a, b) => a.order - b.order);

  // Get the maximum order value
  const orders = updatedZoneOrder.map((zone) => {
    return zone.order;
  });
  const maxOrder = Math.max(...orders);

  // Add the max offset value to each zone order (This avoids integrity issues in the DB)
  updatedZoneOrder.forEach((zone) => {
    zone.order += maxOrder + 1;
  });

  const payloadData = updatedZoneOrder.map((zone) => {
    return {
      type: BOARDS.ZONE_VIEW as string,
      id: zone.zoneViewId,
      attributes: {
        order: zone.order,
      },
    };
  });

  await boardDataSource.upsert({
    objectType: BOARDS.ZONE_VIEW,
    payload: payloadData,
  })

  // Reorder the zones state based on the updated zoneOrder
  const updatedZones = [...zones].sort((a, b) => {
    const orderA = // @ts-ignore
      updatedZoneOrder.find((zone) => zone.id === a.id)?.order || 0;
    const orderB = // @ts-ignore
      updatedZoneOrder.find((zone) => zone.id === b.id)?.order || 0;
    return orderA - orderB;
  });

  return Promise.resolve({
    zones: updatedZones,
    zoneOrder: updatedZoneOrder,
  })
};

export async function getZones(viewId: string, boardDataSource: TsDataSource) {
  return await boardDataSource
    .getListPage({
      objectType: BOARDS.ZONE_VIEW,
      filter: {
        and_: {
          view_id: { eq: { value: viewId } },
        },
      },
    })
    .then(async (data: TDataObjectListOrNull) => {
      const allIds = await Promise.all(
        data?.map(async (zoneView: any) => {
          const zone = await zoneView.fetchRelationships.zone;
          return zone.id;
        }) || []
      );
      // removes duplicate values
      const ids: string[] = Array.from(new Set(allIds));
      const zoneData = await getZoneData(ids, boardDataSource);
      return {
        order: await formatZoneOrders(data),
        zones: zoneData,
      };
    });
}

async function formatZoneOrders(data: TDataObjectListOrNull) {
  const formattedData = await Promise.all(
    data?.map(async (zone: any) => {
      const zoneRelationships = await zone.fetchRelationships.zone;
      return {
        zoneId: zoneRelationships.id,
        order: zone.order,
        zoneViewId: zone.id,
      };
    }) || []
  );
  return formattedData;
}

async function getZoneData(ids: string[], boardDataSource: TsDataSource) {
  return await boardDataSource
    .getListPage({
      objectType: BOARDS.ZONE,
      filter: {
        and_: {
          id: { in_list: { value: ids } },
        },
      },
    })
}


export async function upsertNewZone(
  dataSource: TsDataSource,
  boardDataSource: TsDataSource,
  objectType: string,
  title: string,
  nextOrder: number,
  viewId: string,
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
            datasource: {
              base_url: dataSource.getBaseUrl(),
              api_prefix: dataSource.getApiPrefix(),
            },
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
