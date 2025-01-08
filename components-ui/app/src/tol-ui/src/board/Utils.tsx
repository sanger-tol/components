/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useRef } from 'react';
import { deepCopy, generateId } from '../general/Utils';
import { httpClient } from '../services/http/httpClient';
import { generateFilter, resetAllFilters } from '../filtering/Utils';
import { useEffectUpdate } from '../hooks';
import { IFilter } from '../models/Filter';
import { getUserFromLocalStorage } from '../services/localStorage/localStorageService';
import { TsDataSource } from '../services';


export interface Component {
  data: ComponentData
}

export interface ComponentData {
  id?: string,
  filter?: IFilter
  defaultFilter?: IFilter,
  subFilter?: IFilter,
  filterPassThrough?: boolean,
  type?: string, // component type e.g. table
  size?: string // component size e.g. sm
  order?: number
}

export interface Components {
  [id: string]: Component
}

// filtering is at the zone level
export interface Zone {
  components: Components,
  order: string[],
  filter?: IFilter,
  defaultFilter?: IFilter,
  type?: string
}

export interface Zones {
  [id: string]: Zone
}

export interface IView {
  zones: Zones,
  order: string[]
}

export interface Views {
  [id: string]: IView
}

export interface Board {
  views: Views,
  order: string[]
}

/*
example layout of a board:

export const exampleBoard: Board = {
  views: {
    'viewIdOne': {
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
        }
      },
      order: ['zoneIdOne']
    }
  },
  order: ['viewIdOne']
};
*/

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

export function defineZone(objectType: string, components: ComponentData[], filter?: IFilter) {
  const zone: Zone = {
    components: {},
    order: [],
    type: objectType,
    filter: deepCopy(filter),
    defaultFilter: deepCopy(filter)
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
  filter?: IFilter
}) {
  const {endpoint, baseUrl, components, filter} = params;
  const [zone, setZone] = useState(
    defineZone(endpoint, components as ComponentData[], filter)
  );
  return {
    endpoint: endpoint,
    baseUrl: baseUrl,
    zone: zone,
    setZone: setZone
  } as ZoneMeta;
}

export function generateTranslatedFilter(
  source: ZoneMeta,
  translations: {
    [sourceAttribute: string]: string
  },
  excludeAfterId?: string
) {
  const sourceFilter = generateFilter(source.zone, excludeAfterId, true);
  const translatedFilter = {and_: {}};
  Object.entries(translations).map(([sourceAttribute, targetAttribute]) => {
    if (sourceAttribute in sourceFilter!.and_) {
      translatedFilter.and_[targetAttribute] = sourceFilter!.and_[sourceAttribute]
    }
  });
  return translatedFilter;
}

export function useTranslator(params: {
  source: ZoneMeta,
  target: ZoneMeta,
  translations: {
    [sourceAttribute: string]: string
  },
  excludeAfterId?: string,
  defaultFilter?: IFilter
}) {
  const {source, target, translations, defaultFilter, excludeAfterId} = params;
  const prevFilter: any = useRef(defaultFilter ? defaultFilter : {and_: {}});

  useEffectUpdate(() => {
    const translatedFilter = generateTranslatedFilter(source, translations, excludeAfterId);
    if (JSON.stringify(translatedFilter) !== JSON.stringify(prevFilter.current)) {
      resetAllFilters(target.zone);
      target.zone.filter = translatedFilter;
      target.setZone({...target.zone});
      prevFilter.current = translatedFilter;
    }
  }, [source.zone]);
}

export function getWidgetOrder(layout: any) {
  // Sort the layout array by the 'y' property (and 'x' property in case of a tie)
  layout.sort((a, b) => a.y - b.y || a.x - b.x);

  // Map the sorted layout array to an array of widget objects
  const widgetOrder = layout.map(item => item.i);

  return {
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

export async function getBoard(id: string, ds: any, user: any) {
  const res = await ds.getOne({
    objectType: 'board',
    id: id,
    user_id: user.id
  }).then(async(res: any) => {
    const views = await getViews(res.id, ds)
    return {
      boardTitle: res.title,
      boardFilter: res.filter,
      views: views
    }
  });
  return res;
}

async function getViews(id: string, ds: any) {
  return await httpClient().get('/view_board', {
    params: {
      filter: {
        and_: {
          'board.id': { 'eq': {'value': id} }
        }
      }
    }
  }).then((res: any) => {
    const ids = res.data.data.map((view: any) => view.relationships.view.data.id); // Fix Proxy
    return getViewsData(ids, ds);
  });
}

async function getViewsData(ids: string[], ds: any) {
  return await ds.getListPage({
    objectType: 'view',
    filter: {
      and_: {
        'id': { 'in_list': { 'value': ids } }
      }
    }
  }).then((res: any) => {
    return res;
  })
}

export async function getZones(viewID: string, ds: any) {
  return await httpClient().get('/zone_view',{
    params: {
      filter: {
        and_: {
          'view_id': { 'eq': { 'value': viewID } }
        }
      }
    }
  }).then(async(res: any) => {
    // Removes duplicate values
    const ids: string[] = Array.from(new Set(res.data.data.map((zone: any) => zone.relationships.zone.data.id)));
    const zoneData = await getZoneData(ids, ds);
    return {
      order: formatZoneOrders(res.data.data),
      zones: zoneData,
    }
  });
}

function formatZoneOrders(data: any) {
  const formattedData = data.map((zone: any) => {
    return {
      zoneId: zone.relationships.zone.data.id,
      order: zone.attributes.order,
      zoneViewId: zone.id
    }
  });
  return formattedData;
}

function formatComponentOrders(data: any) {
  const formattedData = data.map((component: any) => {
    return {
      componentId: component.relationships.component.data.id,
      order: component.attributes.order,
      componentZoneId: component.id
    }
  });
  return formattedData;
}

async function getZoneData(ids: string[], ds: any) {
  return await ds.getListPage({
    objectType: 'zone',
    filter: {
      and_: {
        'id': { 'in_list': { 'value': ids } }
      }
    }
  }).then((res: any) => {
    return res;
  })
}

export function saveTitle(title: string, ds: any, id: string, objectType: string) {
  ds.upsert({
    objectType: objectType,
    payload: [{
      type: objectType,
      id: id,
      attributes: {
        title: title,
      },
    }]
  })
}

export async function getComponents(zoneId: string) {
  return await httpClient().get('/component_zone',{
    params: {
      filter: {
        and_: {
          'zone_id': { 'eq': { 'value': zoneId } }
        }
      }
    }
  }).then(async(res: any) => {
    // Removes duplicate values
    return formatComponentOrders(res.data.data)
  });
}

// @ts-ignore
async function getComponentData(ids: string[], ds: any) {
  return await ds.getListPage({
    objectType: 'component',
    filter: {
      and_: {
        'id': { 'in_list': { 'value': ids } }
      }
    }
  }).then((res: any) => {
    return res;
  })
}

export const generateLayout = (components) => {

  const types = { 
    sm: { lg: { w: 1, h: 1 }, md: { w: 1, h: 1 }, sm: { w: 1, h: 1 } }, 
    md: { lg: { w: 2, h: 2 }, md: { w: 2, h: 2 }, sm: { w: 1, h: 2 } }, 
    lg: { lg: { w: 4, h: 2 }, md: { w: 2, h: 2 }, sm: { w: 1, h: 2 } } 
  };

  const layout = { lg: [], md: [], sm: [] };
  const y = { lg: 0, md: 0, sm: 0 };
  const x = { lg: 0, md: 0, sm: 0 };
  
  components.forEach((component) => {
    const type = component.componentType || 'sm';
    ['lg', 'md', 'sm'].forEach(breakpoint => {
      const { w, h } = types[type][breakpoint];
      // if the widget won't fit on the current row, move it to the next row
      if (x[breakpoint] + w > (breakpoint === 'lg' ? 4 : breakpoint === 'md' ? 2 : 1)) {
        y[breakpoint] += h;
        x[breakpoint] = 0;
      }

      layout[breakpoint].push({ i: component.componentId, x: x[breakpoint], y: y[breakpoint], w, h });
      x[breakpoint] += w;
    });
  });

  return layout;
}

export async function createBoardAndView(ds: TsDataSource, id: string, title: string, viewId: string, viewTitle: string) {
  const user = getUserFromLocalStorage();
  const boardId = id ?? generateId("b");
  await ds.upsert({
    objectType: 'board',
    payload: [{
      type: 'board',
      id: boardId,
      attributes: {
        title: title,
        filter: {},
        user_id: user.id
      },
    }]
  }).then(async () => {
    return addView(ds, viewId, viewTitle);
  }).then(async () => {
    await ds.upsert({
      objectType: 'view_board',
      payload: [{
        type: 'view_board',
        attributes: {
          order: 1,
          board_id: boardId,
          view_id: viewId
        }
      }]
    }).catch((err: any) => {
      console.error(err);
    });
  })
}

export async function addView(ds: TsDataSource, id: string, title: string) {
  const user = getUserFromLocalStorage();
  const viewId = id ?? generateId("v");
  await ds.upsert({
    objectType: 'view',
    payload: [{
      type: 'view',
      id: viewId,
      attributes: {
        title: title,
        filter: {},
        user_id: user.id,
      },
    }]
  }).catch((err: any) => {
    console.error(err);
  });
}


export async function addZone(ds: TsDataSource, objectType: string, title: string, nextOrder: number, viewId: string) {
  const user = getUserFromLocalStorage()
  const newId = generateId('z');
  await ds.upsert({
    objectType: 'zone',
    payload: [{
      type: 'zone',
      id: newId,
      attributes: {
        title: title,
        filter: {},
        object_type: objectType,
        user_id: user.id,
      },
    }]
  });

  return await ds.upsert({
    objectType: 'zone_view',
    payload: [{
      type: 'zone_view',
      attributes: {
        order: nextOrder,
        zone_id: newId,
        view_id: viewId
      },
    }]
  }).then((res) => {
    return {
      newZoneId: newId,
      newZoneViewId: res[0].id
    }
  })
}

export async function addComponent(
  ds: any,
  objectType: string,
  title: string,
  nextOrder: number,
  componentType: string,
  widgetType: string,
  zoneId: string,
  baseUrl?: string
) {
  const user = getUserFromLocalStorage()
  const newId = generateId('c');
  await ds.upsert({
    objectType: 'component',
    payload: [{
      type: 'component',
      id: newId,
      attributes: {
        title: title,
        object_type: objectType,
        component_type: componentType,
        widget_type: widgetType,
        filter: {},
        config: {},
        base_url: baseUrl || 'https://portal.tol.sanger.ac.uk/api/v1',
        user_id: user.id,
      },
    }]
  });

  return await ds.upsert({
    objectType: 'component_zone',
    payload: [{
      type: 'component_zone',
      attributes: {
        order: nextOrder,
        component_id: newId,
        zone_id: zoneId
      },
    }]
  }).then((res) => {
    return {
      newComponentId: newId,
      newComponentZoneId: res[0].id
    }
  })
}

export async function upsertComponentConfig(ds: TsDataSource, componentId: string, config: object) {
  return await ds.upsert({
    objectType: 'component',
    payload: [{
      type: 'component',
      id: componentId,
      attributes: {
        config: config
      }
    }]
  });
}
