/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { Layout, Layouts } from "react-grid-layout";
import {
  BOARD_ENTITIES,
  COMPONENT_TYPES,
  defineBoardEntity,
  upsertBoardEntity,
  TsDataSource,
  VISUALISATION_BREAKPOINTS,
} from "../..";
import type {
  IComponent,
  IComponentConfig,
  IFilter,
  IZone,
  TDataObjectListOrNull
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
  setHasDiff?: (hasDiff: boolean) => void,
  userId?: string | undefined,
) {
  const component = zone.children?.[componentId];
  if (!component) return;

  if (editMode) {
    component.config = { ...config };
    return await upsertBoardEntity(boardDataSource, componentId, {
      config: config,
    });
  }

  component.config_diff = {
    id: component.config_diff?.id ?? "",
    config: config as Partial<IComponentConfig>,
  };

  return await boardDataSource
    .upsert({
      objectType: BOARD_ENTITIES.ENTITIES.ENTITY_DIFF,
      payload: [
        {
          type: BOARD_ENTITIES.ENTITIES.ENTITY_DIFF,
          ...(component?.config_diff?.id && { id: component.config_diff.id }),
          attributes: {
            user_id: userId,
            component_id: componentId,
            config: { ...config },
          },
        },
      ],
    })
    .then((res: TDataObjectListOrNull) => {
      // Store the returned id so subsequent saves update the same record
      const returnedId = res?.[0]?.id;
      if (returnedId && component.config_diff) {
        component.config_diff.id = returnedId;
      }
      setHasDiff?.(true);
    })
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
): IZone {
  return defineBoardEntity(
    {
      object_type: objectType,
      filter: filter,
      children: components.reduce(
        (acc, component) => {
          acc[component.id!] = defineBoardEntity(component, BOARD_ENTITIES.ENTITIES.COMPONENT) as IComponent;
          return acc;
        },
        {} as Record<string, IComponent>,
      ),
      order: components.map((component) => component.id!),
    },
    BOARD_ENTITIES.ENTITIES.ZONE,
  ) as IZone;
}

/**
 * Determines the order of widgets from a react grid layout
 * @param layout The React Grid layout
 * @returns A sorted array of component IDs
 */
export function getWidgetOrder(layout: Layout[]): string[] {
  // Sort the layout array by the 'y' property (and 'x' property in case of a tie)
  layout.sort((a, b) => a.y - b.y || a.x - b.x);

  // Map the sorted layout array to an array of widget objects
  return layout.map((item) => item.i);
}

/**
 * Generates a react-grid-layout layout that determines the position and sizing of all of the
 * components in the provided zone.
 * 
 * @param zone The zone containing the components to process
 * @returns The layout describing where the components should be rendered to on the screen
 */
export function generateLayout(zone: IZone): Layouts {
  // The layout we're building up
  const layout: Layouts = { lg: [], md: [], sm: [] };

  // The current position in the grid we're working at for this component.
  // A component will have a different position depending on the size it's being renderered at
  // (which is different per screen size), so they're tracked separately.
  const currentPosition = {
    lg: { x: 0, y: 0 },
    md: { x: 0, y: 0 },
    sm: { x: 0, y: 0 },
  };

  zone.order.forEach((componentId) => {
    const component = zone.children?.[componentId];
    const size = component.widget_type || "sm";

    // As mentioned above, we need to calculate the component's position separately
    // for each size
    Object.keys(VISUALISATION_BREAKPOINTS).forEach((breakpoint) => {
      // Determine the width and height of this component.
      // Filter Block components are treated exceptionally,
      // as they always fill the available width but its height changes depending on the size.
      let w: number, h: number;
      if (component.component_type === COMPONENT_TYPES.FILTER_BLOCK) {
        w = VISUALISATION_BREAKPOINTS.lg[breakpoint].w;
        h = breakpoint === "lg" ? 9 : breakpoint === "md" ? 15 : 26;
      } else {
        ({ w, h } = VISUALISATION_BREAKPOINTS[size][breakpoint]);
      }

      // If the widget won't fit on the current row, start a new row
      if (
        currentPosition[breakpoint].x + w >
        (breakpoint === "lg" ? 4 : breakpoint === "md" ? 2 : 1)
      ) {
        currentPosition[breakpoint].y += h;
        currentPosition[breakpoint].x = 0;
      }

      // Now we know its size, may have adjusted `y` because of adding a new row,
      // and already have the `x` position from the last iteration,
      // this component can be added to the layout.
      layout[breakpoint].push({
        i: component.id,
        ...currentPosition[breakpoint], // `x` and `y`
        w,
        h,
      });

      // Increase the x position we're keeping track of with the width of this new component
      currentPosition[breakpoint].x += w;
    });
  });

  return layout;
}
