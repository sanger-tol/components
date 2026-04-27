/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/


import {
  BOARDS,
  IComponent,
  IZone,
  TsDataSource,
} from "../..";


export async function updateLayout(
  layout,
  zone: IZone,
  setZone: (zone: IZone) => void,
  boardDataSource: TsDataSource,
) {
  // gets the order based off of the layout on screen
  const order = getWidgetOrder(layout);

  // finds the highest order value in the current widgets, based off the db
  const orderValues = Object.values(zone.components).map((component: IComponent) => {
    const order = component.componentZoneOrder;
    return Number(order);
  });
  const highestPreviousOrder = Math.max(...orderValues);

  // maps through the order and upserts based on the componentId
  const payloadData = order.order.map((componentId, index) => {
    const component: IComponent = zone.components[componentId];
    component!.componentZoneOrder = highestPreviousOrder + 1 + index;
    return {
      type: BOARDS.COMPONENT_ZONE,
      id: component!.componentZoneId,
      attributes: {
        order: highestPreviousOrder + index + 1,
      },
    };
  });
  await boardDataSource.upsert({
    objectType: BOARDS.COMPONENT_ZONE,
    payload: payloadData,
  });
  zone.order = order.order;
  setZone({ ...zone });
};

export function getWidgetOrder(layout: any) {
  // Sort the layout array by the 'y' property (and 'x' property in case of a tie)
  layout.sort((a, b) => a.y - b.y || a.x - b.x);

  // Map the sorted layout array to an array of widget objects
  const widgetOrder = layout.map((item) => item.i);

  return {
    order: widgetOrder,
  };
}

export function generateLayout(zone: IZone) {
  // left hand side are the component types, right are the breakpoints
  const types = {
    sm: { lg: { w: 1, h: 10 }, md: { w: 1, h: 10 }, sm: { w: 1, h: 10 } },
    md: { lg: { w: 2, h: 30 }, md: { w: 2, h: 30 }, sm: { w: 1, h: 30 } },
    lg: { lg: { w: 4, h: 40 }, md: { w: 2, h: 40 }, sm: { w: 1, h: 40 } },
  };

  const layout = { lg: [], md: [], sm: [] };
  const y = { lg: 0, md: 0, sm: 0 };
  const x = { lg: 0, md: 0, sm: 0 };

  zone.order.forEach((componentId) => {
    const component = zone.components[componentId];

    const size = component.size || "sm";
    ["lg", "md", "sm"].forEach((breakpoint) => {
      let w, h;
      // filterBlock components have lg width but sm height
      if (component.type === "filterBlock") {
        w = types.lg[breakpoint].w;
        h = breakpoint === "lg" ? 9 : breakpoint === "md" ? 15 : 26;
      } else {
        ({ w, h } = types[size][breakpoint]);
      }
      // if the widget won't fit on the current row, move it to the next row
      if (
        x[breakpoint] + w >
        (breakpoint === "lg" ? 4 : breakpoint === "md" ? 2 : 1)
      ) {
        y[breakpoint] += h;
        x[breakpoint] = 0;
      }

      layout[breakpoint].push({
        i: component.id,
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
