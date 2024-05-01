/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from 'react';
import { deepCopy } from '../general/Utils';


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
  data: {
    filter: Filter
    defaultFilter: Filter
  }
}

export interface Components {
  [id: string]: Component
}

// filtering is at the zone level
export interface Zone {
  components: Components,
  order: string[],
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

// Defining a zone for filtering against
interface ComponentFilter {
  attribute: string,
  filter?: Filter
}

export function defineComponent(component: ComponentFilter, zone: Zone) {
  // setting default as empty if no filter provided
  const empty = {and_: {}};
  const filter = component.filter === undefined ? empty : component.filter;
  zone.components[component.attribute] = {
    data: {
      filter: deepCopy(filter),
      defaultFilter: deepCopy(filter)
    }
  };
}

function defineZone(objectType: string, components: ComponentFilter[]) {
  const zone: Zone = {
    components: {},
    order: [],
    type: objectType
  };
  for (const component of components) {
    defineComponent(component, zone);
    zone.order.push(component.attribute);
  }
  return zone;
}

export function useZone(params: {
  endpoint: string,
  baseUrl?: string,
  components: object[]
}) {
  const {endpoint, baseUrl, components} = params;
  const [zone, setZone] = useState(
    defineZone(endpoint, components as ComponentFilter[])
  );
  return {
    endpoint: endpoint,
    baseUrl: baseUrl,
    zone: zone,
    setZone: setZone
  };
}
