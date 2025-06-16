/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  generateId,
  getUserFromLocalStorage,
  TsDataSource,
  BOARDS,
  TDataObjectListOrNull,
} from "..";


export async function getBoard(
  id: string,
  boardDataSource: TsDataSource
): Promise<{ boardTitle: any; boardFilter: any; views: TDataObjectListOrNull }> {
  return await boardDataSource
    .getOne({
      objectType: BOARDS.BOARD,
      id: id,
    })
    .then(async (board: any) => {
      const views = await getViews(board.id, boardDataSource);
      return {
        boardTitle: board.title,
        boardFilter: board.filter,
        views: views,
      };
    });
}

async function getViews(
  id: string,
  boardDataSource: TsDataSource
): Promise<TDataObjectListOrNull> {
  return await boardDataSource
    .getListPage({
      objectType: BOARDS.VIEW_BOARD,
      filter: {
        and_: {
          "board.id": { eq: { value: id } },
        },
      }
    })
    .then(async (data: TDataObjectListOrNull) => {
      const ids = await Promise.all(
        data?.map(async (viewBoard: any) => {
          const view = await viewBoard.relationships.view;
          return view.id;
        }) || []
      );
      return getViewsData(ids, boardDataSource);
    });
}

async function getViewsData(
  ids: string[],
  boardDataSource: TsDataSource
): Promise<TDataObjectListOrNull> {
  return await boardDataSource
    .getListPage({
      objectType: BOARDS.VIEW,
      filter: {
        and_: {
          id: { in_list: { value: ids } },
        },
      },
    })
}

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
          const zone = await zoneView.relationships.zone;
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
      const zoneRelationships = await zone.relationships.zone;
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

export function saveTitle(
  title: string,
  boardDataSource: TsDataSource,
  id: string,
  objectType: string,
) {
  boardDataSource.upsert({
    objectType: objectType,
    payload: [
      {
        type: objectType,
        id: id,
        attributes: {
          title: title,
        },
      },
    ],
  });
}

export async function getComponents(zoneId: string, boardDataSource: TsDataSource) {
  const componentZoneData = await getComponentZoneData(zoneId, boardDataSource);
  if (componentZoneData) {
    const componentIds = await Promise.all(
      componentZoneData.map(
        async (componentZone) => (await componentZone.relationships.component).id
      )
    ) || [];
    const componentData = await getComponentData(componentIds, boardDataSource);

    return Promise.all(
      componentZoneData.map(async (component) => {
        const componentId = (await component.relationships.component).id;
        const componentDetails = componentData.find(
          (data) => data.id === componentId
        );
        return {
          componentId: componentId,
          order: component.order,
          componentZoneId: component.id,
          componentType: componentDetails?.component_type,
          filter: componentDetails?.filter,
          title: componentDetails?.title,
          objectType: componentDetails?.object_type,
          baseUrl: componentDetails?.base_url,
          apiPrefix: componentDetails?.api_prefix,
          config: componentDetails?.config,
          widgetType: componentDetails?.widget_type,
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
            filter: { and_: {} },
            user_id: user.id,
          },
        },
      ],
    })
    .then(async () => {
      return addView(boardDataSource, viewId, viewTitle);
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

export async function addView(
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

export async function addZone(
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
            base_url: dataSource.getBaseUrl(),
            api_prefix: dataSource.getApiPrefix(),
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

export async function addComponent(
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
            base_url: dataSource.getBaseUrl(),
            api_prefix: dataSource.getApiPrefix(),
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
    });
}

export async function upsertComponentConfig(
  boardDataSource: TsDataSource,
  componentId: string,
  config: object,
) {
  return await upsertComponent(
    boardDataSource,
    componentId,
    { config: config }
  );
}

export function getWidgetOrder(layout: any) {
  // Sort the layout array by the 'y' property (and 'x' property in case of a tie)
  layout.sort((a, b) => a.y - b.y || a.x - b.x);

  // Map the sorted layout array to an array of widget objects
  const widgetOrder = layout.map((item) => item.i);

  return {
    order: widgetOrder,
  };
}

export const generateLayout = (components) => {
  // Left hand side are the component types, right are the breakpoints
  const types = {
    sm: { lg: { w: 1, h: 1 }, md: { w: 1, h: 1 }, sm: { w: 1, h: 1 } },
    md: { lg: { w: 2, h: 3 }, md: { w: 2, h: 3 }, sm: { w: 1, h: 3 } },
    lg: { lg: { w: 4, h: 4 }, md: { w: 2, h: 4 }, sm: { w: 1, h: 4 } },
  };

  const layout = { lg: [], md: [], sm: [] };
  const y = { lg: 0, md: 0, sm: 0 };
  const x = { lg: 0, md: 0, sm: 0 };

  components.forEach((component) => {
    const type = component.widgetType || "sm";
    ["lg", "md", "sm"].forEach((breakpoint) => {
      const { w, h } = types[type][breakpoint];
      // if the widget won't fit on the current row, move it to the next row
      if (
        x[breakpoint] + w >
        (breakpoint === "lg" ? 4 : breakpoint === "md" ? 2 : 1)
      ) {
        y[breakpoint] += h;
        x[breakpoint] = 0;
      }

      layout[breakpoint].push({
        i: component.componentId,
        x: x[breakpoint],
        y: y[breakpoint],
        w,
        h,
      });
      x[breakpoint] += w;
    });
  });

  return layout;
};
