/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useRef, useState } from "react";
import {
  IRemoteTargetAndZone,
  IZone,
  TsDataSource,
  IComponentData,
  IFilter,
  useEffectUpdate,
  generateFilter,
  resetAllFilters,
  deepCopy,
  useStateFallback,
  IUseZoneMeta,
} from "..";


export function useZone(params: {
  objectType: string;
  dataSource: TsDataSource;
  components: IComponentData[];
  filter?: IFilter;
}) {
  const { objectType, dataSource, components, filter } = params;
  const [zone, setZone] = useState(
    defineZoneWithComponentList(
      objectType,
      components,
      filter
    ),
  );
  return {
    objectType,
    dataSource,
    zone,
    setZone,
  } as IUseZoneMeta;
}

export function generateTranslatedFilter(
  source: IUseZoneMeta,
  translations: {
    [sourceAttribute: string]: string;
  },
  excludeAfterId?: string,
) {
  const sourceFilter = generateFilter(source.zone, excludeAfterId, true);
  const translatedFilter = { and_: {} };
  Object.entries(translations).map(([sourceAttribute, targetAttribute]) => {
    if (sourceFilter?.and_ && sourceAttribute in sourceFilter.and_) {
      translatedFilter.and_[targetAttribute] = sourceFilter.and_[sourceAttribute];
    }
  });
  return translatedFilter;
}

export function useTranslator(params: {
  source: IUseZoneMeta;
  target: IUseZoneMeta;
  translations: {
    [sourceAttribute: string]: string;
  };
  excludeAfterId?: string;
  defaultFilter?: IFilter;
}) {
  const { source, target, translations, defaultFilter, excludeAfterId } =
    params;
  const prevFilter: any = useRef(defaultFilter ? defaultFilter : { and_: {} });

  useEffectUpdate(() => {
    const translatedFilter = generateTranslatedFilter(
      source,
      translations,
      excludeAfterId,
    );
    if (
      JSON.stringify(translatedFilter) !== JSON.stringify(prevFilter.current)
    ) {
      resetAllFilters(target.zone);
      target.zone.filter = translatedFilter;
      target.setZone({ ...target.zone });
      prevFilter.current = translatedFilter;
    }
  }, [source.zone]);
}

export function defineComponent(component: IComponentData, zone: IZone) {
  // setting default as empty if no filter provided
  const f = component.filter === undefined ? { and_: {} } : component.filter;
  zone.components[component.id!] = {
    data: {
      filter: deepCopy(f),
      defaultFilter: deepCopy(f),
      ...component,
    },
  };
}

export function addComponent(component: IComponentData, zone: IZone) {
  defineComponent(component, zone);
  zone.order.push(component.id!);
}

export function addComponents(components: IComponentData[], zone: IZone) {
  for (const component of Object.values(components)) {
    addComponent(component, zone);
  }
}

/**
 * Defines a zone with the given parameters and adds the specified components to it.
 * @param objectType - The type of the zone object.
 * @param components - An object containing the components to be added to the zone.
 * @param objectType - The type of the zone object.
 * @param filter - An optional filter to be applied to the zone.
 * @returns The defined zone with the added components.
 */
export function defineZone({
  components = {},
  order = [],
  objectType,
  filter = { and_: {} },
  ...rest
}: IZone): IZone {
  const zone: IZone = {
    components: components,
    order: order,
    objectType: objectType,
    filter: deepCopy(filter),
    defaultFilter: deepCopy(filter),
    ...rest
  };
  addComponents(order.map(id => (components[id].data)), zone);
  return zone;
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
  components: IComponentData[],
  filter?: IFilter,
) {
  return defineZone({
    objectType,
    filter,
    components: components.reduce((acc, component) => {
      acc[component.id!] = { data: component };
      return acc;
    }, {} as { [id: string]: { data: IComponentData } }),
    order: components.map(component => component.id!),
  });
}

/**
 * A custom hook that provides a fallback mechanism for managing the state of a zone.
 *
 * @param id - The unique identifier for the component.
 * @param objectType - The type of the object associated with the zone.
 * @param zone - The current state of the zone.
 * @param setZone - A function to update the state of the zone.
 * 
 * @returns A tuple containing the current state of the zone and a function to update it.
 */
export function useZoneStateFallback({
  id,
  objectType,
  zone,
  setZone,
}: IRemoteTargetAndZone & { id: string }): [any, (state: any) => void] {
  return useStateFallback(
    zone,
    setZone,
    defineZoneWithComponentList(
      objectType,
      [{ id: id }],
    ),
  );
}
