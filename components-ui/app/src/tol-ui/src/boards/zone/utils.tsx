/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { BOARDS, generateId, getUserFromLocalStorage, IComponentData, IDBZoneView, IZone, TsDataSource } from "../..";


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

export async function getComponents(
  zoneId: string,
  boardDataSource: TsDataSource
): Promise<IComponentData[] | undefined> {
  const componentZoneData = await getComponentZoneData(zoneId, boardDataSource);
  if (componentZoneData) {
    const componentIds = (
      await Promise.all(
        componentZoneData.map(
          async (componentZone) => (await componentZone.fetchRelationships?.component)?.id
        )
      )
    ).filter((id): id is string => typeof id === "string"); // remove undefined values
    const componentData = await getComponentData(componentIds, boardDataSource);

    return Promise.all(
      componentZoneData.map(async (component) => {
        const componentId = (await component.fetchRelationships?.component)?.id;
        const componentDetails = componentData.find(
          (data) => data.id === componentId
        );
        return {
          id: componentId,
          order: component.order,
          componentZoneId: component.id,
          type: componentDetails?.component_type,
          filter: componentDetails?.filter,
          title: componentDetails?.title,
          objectType: componentDetails?.object_type,
          baseUrl: componentDetails?.datasource?.base_url,
          apiPrefix: componentDetails?.datasource?.api_prefix,
          config: componentDetails?.config,
          size: componentDetails?.widget_type,
          filterPassThrough: componentDetails?.filter_pass_through,
        };
      })
    );
  }
}

async function getComponentZoneData(zoneId: string, boardDataSource: TsDataSource) {
  return await boardDataSource
    .getListPage({
      objectType: BOARDS.COMPONENT_ZONE,
      filter: {
        and_: {
          zone_id: { eq: { value: zoneId } },
        },
      },
    });
}

async function getComponentData(
  componentIds: string[],
  boardDataSource: TsDataSource,
): Promise<any> {
  return await boardDataSource
    .getListPage({
      objectType: BOARDS.COMPONENT,
      filter: {
        and_: {
          id: { in_list: { value: componentIds } },
        },
      },
    });
}

export async function upsertNewComponent(
  dataSource: TsDataSource,
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
            datasource: {
              base_url: dataSource.getBaseUrl(),
              api_prefix: dataSource.getApiPrefix(),
            },
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
