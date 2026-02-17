/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/


import {
  BOARDS,
  generateFilter,
  IComponent,
  IComponentData,
  IZone,
  TitleTooltip,
  TsDataSource,
  Visualisation,
} from "../..";


export async function updateLayout(
  layout,
  setSaveLayout: (value: boolean) => void,
  zone: IZone,
  setZone: (zone: IZone) => void,
  boardDataSource: TsDataSource,
) {
  // gets the order based off of the layout on screen
  const order = getWidgetOrder(layout);

  // finds the highest order value in the current widgets, based off the db
  const orderValues = Object.values(zone.components).map((component: IComponent) => {
    const order = component.data.order;
    return Number(order);
  });
  const highestPreviousOrder = Math.max(...orderValues);

  // maps through the order and upserts based on the componentId
  const payloadData = order.order.map((componentId, index) => {
    const component: IComponentData = zone.components[componentId].data;
    component!.order = highestPreviousOrder + 1 + index;
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
  setSaveLayout(false);
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
    sm: { lg: { w: 1, h: 1 }, md: { w: 1, h: 1 }, sm: { w: 1, h: 1 } },
    md: { lg: { w: 2, h: 3 }, md: { w: 2, h: 3 }, sm: { w: 1, h: 3 } },
    lg: { lg: { w: 4, h: 4 }, md: { w: 2, h: 4 }, sm: { w: 1, h: 4 } },
  };

  const layout = { lg: [], md: [], sm: [] };
  const y = { lg: 0, md: 0, sm: 0 };
  const x = { lg: 0, md: 0, sm: 0 };

  zone.order.forEach((componentId) => {
    const component = zone.components[componentId].data;

    const type = component.size || "sm";
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

export function generateVisualisations(
  zone: IZone,
  setZone: (zone: IZone) => void,
  boardDataSource: TsDataSource,
) {
  return zone.order.map((componentId) => {
    const component = zone.components[componentId].data;
    
    return (
      <div key={component.id} className="tol-visualisation">
        <Visualisation
          id={component.id!}
          size={component.size!}
          zone={zone}
          setZone={setZone}
          componentType={component.type!}
          config={component.config}
          objectType={component.objectType!}
          dataSource={component.dataspace!}
          boardDataSource={boardDataSource}
          boardObjectType={BOARDS.COMPONENT}
          title={component.title!}
        />
      </div>
    )
  });
}
