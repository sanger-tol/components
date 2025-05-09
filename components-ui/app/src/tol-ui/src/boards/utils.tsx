/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { generateId } from "../general/utils";
import { getUserFromLocalStorage } from "../services/localStorage/localStorageService";
import { TsDataSource } from "../datasource";
import { BOARDS } from "../constants/api.constants";


export async function getBoard(id: string, dataSource: TsDataSource) {
  const res = await dataSource
    .getOne({
      objectType: BOARDS.BOARD,
      id: id,
    })
    .then(async (res: any) => {
      const views = await getViews(res.id, dataSource);
      return {
        boardTitle: res.title,
        boardFilter: res.filter,
        views: views,
      };
    });
  return res;
}

async function getViews(id: string, dataSource: TsDataSource) {
  return await dataSource
    .getListPage({
      objectType: BOARDS.VIEW_BOARD,
      filter: {
        and_: {
          "board.id": { eq: { value: id } },
        },
      }
    })
    .then((res: any) => {
      const ids = res.data.data.map(
        (view: any) => view.relationships.view.data.id, // TODO: ENSURE THIS IS CORRECT
      );
      return getViewsData(ids, dataSource);
    });
}

async function getViewsData(ids: string[], dataSource: TsDataSource) {
  return await dataSource
    .getListPage({
      objectType: BOARDS.VIEW,
      filter: {
        and_: {
          id: { in_list: { value: ids } },
        },
      },
    })
    .then((res: any) => {
      return res;
    });
}

export async function getZones(viewId: string, dataSource: TsDataSource) {
  return await dataSource
    .getListPage({
      objectType: BOARDS.ZONE_VIEW,
      filter: {
        and_: {
          view_id: { eq: { value: viewId } },
        },
      },
    })
    .then(async (res: any) => {
      // removes duplicate values
      const ids: string[] = Array.from(
        new Set(
          res.data.data.map((zone: any) => zone.relationships.zone.data.id),
        ),
      );
      const zoneData = await getZoneData(ids, dataSource);
      return {
        order: formatZoneOrders(res.data.data),
        zones: zoneData,
      };
    });
}

function formatZoneOrders(data: any) {
  const formattedData = data.map((zone: any) => {
    return {
      zoneId: zone.relationships.zone.data.id,
      order: zone.attributes.order,
      zoneViewId: zone.id,
    };
  });
  return formattedData;
}

async function getZoneData(ids: string[], dataSource: TsDataSource) {
  return await dataSource
    .getListPage({
      objectType: BOARDS.ZONE,
      filter: {
        and_: {
          id: { in_list: { value: ids } },
        },
      },
    })
    .then((res: any) => {
      return res;
    });
}

export function saveTitle(
  title: string,
  dataSource: TsDataSource,
  id: string,
  objectType: string,
) {
  dataSource.upsert({
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

export async function getComponents(zoneId: string, dataSource: TsDataSource) {
  const componentZoneData = await getComponentZoneData(zoneId, dataSource);
  // @ts-ignore
  const componentIds = componentZoneData.data.data.map(
    (component: any) => component.relationships.component.data.id,
  );
  const componentData = await getComponentData(componentIds, dataSource);

  // @ts-ignore
  return componentZoneData.data.data.map((component: any) => {
    const componentId = component.relationships.component.data.id;
    const componentDetails = componentData.find(
      (data: any) => data.id === componentId,
    );
    return {
      componentId: componentId,
      order: component.attributes.order,
      componentZoneId: component.id,
      componentType: componentDetails.component_type,
      filter: componentDetails.filter,
      title: componentDetails.title,
      objectType: componentDetails.object_type,
      baseUrl: componentDetails.base_url,
      config: componentDetails.config,
      widgetType: componentDetails.widget_type,
      filterPassThrough: componentDetails.filter_pass_through,
    };
  });
}

async function getComponentZoneData(zoneId: string, dataSource: TsDataSource) {
  return await dataSource
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
  dataSource: TsDataSource,
): Promise<any> {
  return await dataSource
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
  dataSource: TsDataSource,
  id: string,
  title: string,
  viewId: string,
  viewTitle: string,
) {
  const user = getUserFromLocalStorage();
  const boardId = id ?? generateId("b");
  await dataSource
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
      return addView(dataSource, viewId, viewTitle);
    })
    .then(async () => {
      await dataSource
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

export async function addView(dataSource: TsDataSource, id: string, title: string = "View 1") {
  const user = getUserFromLocalStorage();
  const viewId = id ?? generateId("v");
  await dataSource
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
      return {
        newZoneId: newId,
        newZoneViewId: res[0].id,
      };
    });
}

export async function upsertZone(
  dataSource: TsDataSource,
  zoneId: string,
  attributes: object,
) {
  return await dataSource
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
      return {
        newComponentId: newId,
        newComponentZoneId: res[0].id,
      };
    });
}

export async function upsertComponent(
  dataSource: TsDataSource,
  componentId: string,
  attributes: object,
) {
  return await dataSource
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
  dataSource: TsDataSource,
  componentId: string,
  config: object,
) {
  return await upsertComponent(
    dataSource,
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
