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
} from "..";


interface ZoneMeta {
  objectType: string;
  dataSource: TsDataSource;
  zone: IZone;
  setZone: any;
}

export function useZone(params: {
  objectType: string;
  dataSource: TsDataSource;
  components: IComponentData[];
  filter?: IFilter;
}) {
  const { objectType, dataSource, components, filter } = params;
  const [zone, setZone] = useState(
    defineZone(
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
  } as ZoneMeta;
}

export function generateTranslatedFilter(
  source: ZoneMeta,
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
  source: ZoneMeta;
  target: ZoneMeta;
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

export function defineZone(
  objectType: string,
  components: IComponentData[],
  filter?: IFilter,
) {
  const f = filter === undefined ? { and_: {} } : filter;
  const zone: IZone = {
    components: {},
    order: [],
    type: objectType,
    filter: deepCopy(f),
    defaultFilter: deepCopy(f),
  };
  for (const component of components) {
    defineComponent(component, zone);
    zone.order.push(component.id!);
  }
  return zone;
}

/**
 * A custom hook that provides a fallback mechanism for managing the state of a zone.
 *
 * @param {IRemoteTargetAndZone & { id: string }} params - The parameters for the hook.
 * @param {string} params.id - The unique identifier for the component.
 * @param {string} params.objectType - The type of the object associated with the zone.
 * @param {any} params.zone - The current state of the zone.
 * @param {(state: any) => void} params.setZone - A function to update the state of the zone.
 * 
 * @returns {[any, (state: any) => void]} - A tuple containing the current state of the zone and a function to update it.
 */
export function useZoneStateFallback({
  id,
  objectType,
  zone,
  setZone,
}: IRemoteTargetAndZone & {id: string}): [any, (state: any) => void] {
  return useStateFallback(
    zone,
    setZone,
    defineZone(
      objectType,
      [{id: id}],
    ),
  );
}
