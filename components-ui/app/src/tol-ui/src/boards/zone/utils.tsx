/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  BOARDS,
  generateId,
  getUserFromLocalStorage,
  IZone,
  TsDataSource
} from "../..";


export function getNextComponentOrder(zone: IZone) {
  const highestOrder = Object.values(zone.components).reduce(
    (max, component) => {
      return component.data.order! > max ? component.data.order : max;
    },
    0,
  );
  return highestOrder! + 1;
}

export function getNextZoneOrder(zoneOrder: IDBZoneView[]) {
  const orders = zoneOrder.map((zone) => {
    return zone.order;
  });
  return orders.length > 0 ? Math.max(...orders) + 1 : 1;
}

export async function upsertNewComponent(
  dataspace: TsDataSource,
  boardDataSource: TsDataSource,
  objectType: string,
  title: string,
  nextOrder: number,
  componentType: string,
  widgetType: string,
  zoneId: string,
) {
  const user = getUserFromLocalStorage();
  const newId = generateId("c");
  await boardDataSource
    .upsert({
      objectType: BOARDS.COMPONENT,
      payload: [
        {
          type: BOARDS.COMPONENT,
          id: newId,
          attributes: {
            title: title,
            object_type: objectType,
            component_type: componentType,
            widget_type: widgetType,
            filter: { and_: {} },
            config: {},
            data_source_instance_id: dataspace.getDataSourceInstanceId(),
            user_id: user.id,
            filter_pass_through: false,
          },
        },
      ],
    });

  return await boardDataSource
    .upsert({
      objectType: BOARDS.COMPONENT_ZONE,
      payload: [
        {
          type: BOARDS.COMPONENT_ZONE,
          attributes: {
            order: nextOrder,
            component_id: newId,
            zone_id: zoneId,
          },
        },
      ],
    })
    .then((res) => {
      if (res && res[0]) {
        return {
          newComponentId: newId,
          newComponentZoneId: res[0].id,
        };
      }
      throw new Error("Unexpected null response for Component Zone creation");
    });
}
