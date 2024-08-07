/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useRef } from 'react';
import { deepCopy } from '../general/Utils';
import { httpClient } from '../services/http/httpClient';
import { generateFilter, mergeAndFilters, resetAllFilters } from '../filtering/Utils';
import { useEffectUpdate } from '../hooks';


export interface AndFilter {
  [operator: string]: {
    value?: any,
    negate?: boolean
  }
}

export interface And {
  [attribute: string]: AndFilter
}

export interface Filter {
  and_: And
}

export interface Component {
  data: ComponentData
}

export interface ComponentData {
  id?: string, // the dict key in most cases
  filter?: Filter
  defaultFilter?: Filter,
  subFilter?: Filter,
  filterPassThrough?: boolean,
  type?: string, // component type e.g. table
  size?: string // component size e.g. sm
  props?: object // component props
}

export interface Components {
  [id: string]: Component
}

// filtering is at the zone level
export interface Zone {
  components: Components,
  order: string[],
  filter?: Filter, // global zone filter
  type?: string
}

export interface Zones {
  [id: string]: Zone
}

export interface Board {
  zones: Zones,
  order: string[]
}

export const exampleBoard: Board = {
  zones: {
    'zoneIdOne': {
      components: {
        'componentIdOne': {
          data: {
            filter: {
              and_: {
                'attributeId': {
                  eq: {
                    value: 'hello',
                    negate: true
                  }
                }
              }
            },
            defaultFilter: {
              and_: {
                'attributeId': {
                  eq: {
                    value: 'hello',
                    negate: true
                  }
                }
              }
            }
          },
        }
      },
      order: ['componentIdOne'],
      type: 'species'
    },
  },
  order: ['zoneIdOne']
};

export function defineComponent(component: ComponentData, zone: Zone) {
  // setting default as empty if no filter provided
  const empty = {and_: {}};
  const filter = component.filter === undefined ? empty : component.filter;
  zone.components[component.id!] = {
    data: {
      filter: deepCopy(filter),
      defaultFilter: deepCopy(filter),
      ...component
    }
  };
}

export function defineZone(objectType: string, components: ComponentData[]) {
  const zone: Zone = {
    components: {},
    order: [],
    type: objectType
  };
  for (const component of components) {
    defineComponent(component, zone);
    zone.order.push(component.id!);
  }
  return zone;
}

interface ZoneMeta {
  endpoint: string,
  baseUrl?: string,
  zone: Zone,
  setZone: any
}

export function useZone(params: {
  endpoint: string,
  baseUrl?: string,
  components: object[],
  filter?: Filter
}) {
  const {endpoint, baseUrl, components} = params;
  const [zone, setZone] = useState(
    defineZone(endpoint, components as ComponentData[])
  );
  return {
    endpoint: endpoint,
    baseUrl: baseUrl,
    zone: zone,
    setZone: setZone
  } as ZoneMeta;
}

export function useTranslator(params: {
  source: ZoneMeta, // source zone
  target: ZoneMeta, // target zone
  translations: {
    [sourceAttribute: string]: string
  }
}) {
  /*
  const {source, target, translations} = params;
  const prevFilter = useRef(undefined);

  useEffectUpdate(() => {
    const sourceFilter = generateFilter(source.zone);
    console.log(JSON.stringify(sourceFilter), JSON.stringify(prevFilter.current));
    if (JSON.stringify(sourceFilter) !== JSON.stringify(prevFilter.current)) {
      resetAllFilters(target.zone);
      Object.entries(translations).map(([sourceAttribute, targetAttribute]) => {
        if (sourceAttribute in sourceFilter!.and_) {
          if (!target.zone.filter) target.zone.filter = {and_: {}};
          // merge filter with new key
          target.zone.filter.and_ = mergeAndFilters(
            target.zone.filter.and_,
            {[targetAttribute]: sourceFilter!.and_[sourceAttribute]}
          );
        }
      });
      target.setZone({...target.zone});
      prevFilter.current = sourceFilter;
    }
  }, [source.zone]);
  */
  return {and_: {}};
}

export function getWidgetOrder(layout, widgets) {
  // Sort the layout array by the 'y' property (and 'x' property in case of a tie)
  layout.sort((a, b) => a.y - b.y || a.x - b.x);

  // Map the sorted layout array to an array of widget objects
  const widgetOrder = layout.map(item => item.i);

  return {
    components: widgets['components'],
    order: widgetOrder
  };
}

async function getObjectTypes(baseUrl: string) {
  const res = await httpClient().get('/_config/attribute_types', {
    baseURL: baseUrl
  });
  // @ts-ignore
  return Object.keys(res.data);

}

export async function fetchObjectTypes(baseUrl: string) {
  return await getObjectTypes(baseUrl);
}