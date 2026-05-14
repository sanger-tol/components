/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  BOARDS,
  defineBoardEntity,
  IComponent,
  IFilter,
  IZone,
  TsDataSource,
} from "../..";

/**
 * Update the component state and upsert the component with the new config.
 * @param componentId The id of the component to be updated.
 * @param config The new config to be applied to the component.
 * @param zone The zone the component belongs to, used to update the component state locally.
 * @param boardDataSource The data source used to upsert the updated component to the backend.
 * @returns The result of the upsert operation.
 */
export async function updateComponentConfigAndUpsert(
  componentId: string,
  config: object,
  zone: IZone,
  boardDataSource: TsDataSource,
  editMode: boolean,
  setHasDiff: (hasDiff: boolean) => void,
  userId: string | undefined,
) {
  const component = zone.children?.[0]?.[componentId];
  if (!component) return;

  if (editMode) {
    component.config = { ...config };
    // return await upsertCoreBoardEntity(
    //   BOARDS.COMPONENT,
    //   { config: config },
    //   boardDataSource,
    //   undefined,
    //   componentId,
    // );
  }

  component.config_diff = { ...component.config_diff, config: config };
  return await boardDataSource
    .upsert({
      objectType: BOARDS.BOARD_DIFF,
      payload: [
        {
          type: BOARDS.BOARD_DIFF,
          ...(component.config_diff.id && { id: component.config_diff.id }),
          attributes: {
            user_id: userId,
            component_id: componentId,
            config: { ...config },
          },
        },
      ],
    })
    .then(() => setHasDiff(true))
    .catch((error) => {
      console.error("Error upserting board diff:", error);
    });
}

/**
 * Simplified of defineZone for when you just want to pass a list of components without needing to worry about the structure of the zone object.
 *
 * @param objectType - The type of the zone object.
 * @param components - An array of component data to be added to the zone.
 * @param filter - An optional filter to be applied to the zone.
 *
 * @returns The defined zone with the added components.
 */
export function defineZoneWithComponentList(
  objectType: string,
  components: IComponent[],
  filter?: IFilter,
) {
  return defineBoardEntity<IZone>(
    {
      object_type: objectType,
      filter: filter,
      children: components.reduce(
        (acc, component) => {
          acc[component.id!] = component;
          return acc;
        },
        {} as Record<string, IComponent>,
      ),
      order: components.map((component) => component.id!),
    },
    BOARDS.ZONE,
  );
}

// TODO: Fix, leaving all broken things here
export async function updateLayout(
  layout,
  zone: IZone,
  setZone: (zone: IZone) => void,
  boardDataSource: TsDataSource,
) {
  // gets the order based off of the layout on screen
  const order = getWidgetOrder(layout);

  // finds the highest order value in the current widgets, based off the db
  const orderValues = Object.values(zone.children?.[0] ?? {}).map(
    (component: IComponent) => {
      const order = component.componentZoneOrder;
      return Number(order);
    },
  );
  const highestPreviousOrder = Math.max(...orderValues);

  // maps through the order and upserts based on the componentId
  const payloadData = order.order.map((componentId, index) => {
    const component: IComponent = zone.children?.[0]?.[componentId];
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
    const component = zone.children?.[0]?.[componentId];

    const size = component.widget_type || "sm";
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
}
