/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useRef, useState } from "react";
import { IZone } from "../models";
import { TsDataSource } from "../datasource";
import { IComponentData, IFilter } from "../models";
import { useEffectUpdate } from "./useEffectUpdate";
import { generateFilter, resetAllFilters } from "../filtering/utils";
import { deepCopy } from "../general/utils";

interface ZoneMeta {
  ds: TsDataSource;
  objectType: string;
  zone: IZone;
  setZone: any;
}

export function useZone(params: {
  ds: TsDataSource;
  objectType: string;
  components: IComponentData[];
  filter?: IFilter;
}) {
  const { objectType, ds, components, filter } = params;
  const [zone, setZone] = useState(
    defineZone(
      objectType,
      components,
      filter
    ),
  );
  return {
    ds,
    objectType,
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
    if (sourceAttribute in sourceFilter!.and_) {
      translatedFilter.and_[targetAttribute] =
        sourceFilter!.and_[sourceAttribute];
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
