/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  BOARDS,
  generateId,
  getUserFromLocalStorage,
  IComponentData,
  IDBZoneView,
  IZone,
  TDataObjectListOrNull,
  TDataObjectOrNull,
  TsDataSource,
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

export async function getComponents(
  zoneId: string,
  boardDataSource: TsDataSource,
): Promise<IComponentData[] | undefined> {
  const componentZoneData = await getComponentZoneData(zoneId, boardDataSource);
  if (componentZoneData) {
    const componentIds = (
      await Promise.all(
        componentZoneData.map(
          async (componentZone) =>
            (await componentZone?.fetchRelationships?.component)?.["id"],
        ),
      )
    ).filter((id): id is string => typeof id === "string"); // remove undefined values
    const componentData = await getComponentData(componentIds, boardDataSource);

    return Promise.all(
      componentZoneData.map(async (component) => {
        const componentId = (await component?.fetchRelationships?.component)?.[
          "id"
        ];
        const componentDetails = componentData?.find(
          (data) => data?.id === componentId,
        );
        const dsi = componentDetails?.relationships?.data_source_instance;
        return {
          id: componentId,
          order: component?.order,
          componentZoneId: component?.id,
          type: componentDetails?.component_type,
          filter: componentDetails?.filter,
          title: componentDetails?.title,
          objectType: componentDetails?.object_type,
          dataspace: new TsDataSource({
            ...dsi?.["ui_api_details"],
            dataSourceInstanceId: dsi?.["id"],
          }),
          config: componentDetails?.config,
          size: componentDetails?.widget_type,
          filterPassThrough: componentDetails?.filter_pass_through,
        };
      }),
    );
  }
}

async function getComponentZoneData(
  zoneId: string,
  boardDataSource: TsDataSource,
) {
  return await boardDataSource.getListPage({
    objectType: BOARDS.COMPONENT_ZONE,
    filter: {
      and_: {
        zone_id: { eq: { value: zoneId } },
      },
    },
  });
}

/**
 * Fetches board component data and merges with any user-specific configuration diffs.
 *
 * Retrieves the base component records for the given IDs, then fetches any saved
 * diff records for the current user. If a diff exists for a component and its config
 * is non-null, the component is wrapped in a `Proxy` that overrides the `config`
 * property with the diff's value. A null diff config indicates the config was reset
 * and is therefore not applied.
 *
 * @param componentIds - The IDs of the components to fetch
 * @param boardDataSource - The data source used to query component and diff records
 * @returns A list of component data objects, with user diffs applied where present,
 * or `null` if no component data was returned
 */
async function getComponentData(
  componentIds: string[],
  boardDataSource: TsDataSource,
): Promise<TDataObjectListOrNull> {
  // Fetch board components
  const boardData = await boardDataSource.getListPage({
    objectType: BOARDS.COMPONENT,
    filter: {
      and_: {
        id: { in_list: { value: componentIds } },
      },
    },
    requestedFields: ["data_source_instance.ui_api_details"],
  });

  //Fetch diff's based on component id's
  const boardDiff = await boardDataSource.getListPage({
    objectType: BOARDS.BOARD_DIFF,
    filter: {
      and_: {
        component_id: { in_list: { value: componentIds } },
        user_id: { eq: { value: getUserFromLocalStorage()?.id } },
      },
    },
    requestedFields: ["config", "component_id"],
  });

  return (
    // Map over each component and replace diff config if exists
    boardData?.map((component: TDataObjectOrNull) => {
      if (!component) return component;
      const diff = boardDiff?.find(
        (d: TDataObjectOrNull) => d?.["component_id"] === component.id,
      );
      // Only apply the diff when config is non-null; null means the diff was reset
      if (diff && diff.config != null) {
        // Create new proxy and intercept get method to return new config
        return new Proxy(component, {
          get(target, prop, receiver) {
            if (prop === "config") return diff.config;
            return Reflect.get(target, prop, receiver);
          },
        });
      }
      return component;
    }) ?? null
  );
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
  await boardDataSource.upsert({
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
