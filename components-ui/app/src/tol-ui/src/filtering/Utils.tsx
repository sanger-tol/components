/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect } from 'react';
import { Zone, Filter, defineComponent, And } from '../board/Utils';
import { deepCopy, isEmptyObject } from '../general/Utils';


function getComponentsAbove(id: string, list: string[]) {
  const index = list.indexOf(id);
  return list.slice(0, index + 1);
}

function getComponentsBelow(id: string, list: string[]) {
  const index = list.indexOf(id);
  return index === -1 ? [] : list.slice(index, list.length);
}

export function getNextComponentId(id: string, list: string[], indexOffset: number) {
  const index = list.indexOf(id);
  return list[index + indexOffset];
}

export function filterHasUpdated(setFilter: any, exisitingFilter?: object, incomingFilter?: object) {
  // force setFilter update if zone is not defined - this only occurs on initial load
  if (incomingFilter === undefined) {
    setFilter(undefined);
    return false;
  }
  const exisiting = JSON.stringify(exisitingFilter);
  const incoming = JSON.stringify(incomingFilter);
  const hasUpdated = exisiting !== incoming;
  if (hasUpdated) setFilter(deepCopy(incomingFilter));
  return hasUpdated;
}

export function mergeAndFilters(target: object, incoming: object) {
  const output = deepCopy(target);
  for (const id in incoming) {
    const currentOut = id in output ? output[id] : {};
    const currentIn = id in incoming ? incoming[id] : {};
    output[id] = Object.assign(currentOut, currentIn);
  }
  return output as And;
}

export function generateFilter(zone?: object, id?: string, includeSubFilter?: boolean) {
  if (zone === undefined) return undefined;
  const z = zone as Zone;
  const aboveComponents = id ? getComponentsAbove(id, z.order) : z.order;
  let compoundedFilter: And = z.filter ? z.filter.and_ : {};
  // loop through above components
  for (const currentId of aboveComponents) {
    // exclude pass throughs except self
    if (z.components[currentId].data.filterPassThrough && id !== currentId) {
      continue;
    }
    let currentFilter: And = z.components[currentId].data.filter!.and_;
    // include sub filter if required
    const subFilter = z.components[currentId].data.subFilter;
    if ((currentId !== id || includeSubFilter) && subFilter) {
      currentFilter = mergeAndFilters(currentFilter, subFilter.and_);
    }
    compoundedFilter = mergeAndFilters(currentFilter, compoundedFilter);
  }
  return {
    and_: compoundedFilter
  } as Filter;
}

// insert a value in a list after an id located
function addValueBelow(id: string, value: string, list: string[]) {
  const idIndex = list.indexOf(id);
  list.splice(idIndex+1, 0, value);
  return list;
}

export function addComponentBelow(id: string, newId: string, zone: Zone) {
  defineComponent({
    id: newId,
    filterPassThrough: zone.components[id].data.filterPassThrough
  }, zone);
  zone.order = addValueBelow(id, newId, zone.order);
}

export function resetFiltersBelow(params: {
  id: string,
  zone?: object,
  indexOffset?: number
}) {
  const {zone, indexOffset} = params;
  let id = params.id;
  const z = zone as Zone;
  if (indexOffset !== undefined) id = getNextComponentId(id, z.order, indexOffset);
  for (const currentId of getComponentsBelow(id, z.order)) {
    z.components[currentId].data.filter = deepCopy(z.components[currentId].data.defaultFilter!);
    z.components[currentId].data.subFilter = undefined;
  }
}

export function resetAllFilters(zone: Zone) {
  zone.filter = deepCopy(zone.defaultFilter!);
  for (const currentId of zone.order) {
    zone.components[currentId].data.filter = deepCopy(zone.components[currentId].data.defaultFilter!);
    zone.components[currentId].data.subFilter = undefined;
  }
}

export function removeComponent(id: string, zone: Zone) {
  delete zone.components[id];
  zone.order = zone.order.filter((currentId) => currentId !== id);
}

export function setFilter(params: {
  // and_ filter attributes
  operator: string,
  value?: any,
  negate: boolean,
  exists?: boolean,
  // filter location
  attribute: string,
  componentId: string,
  // filter state
  zone: object,
  // differentials
  valueExists?: any
}) {
  const {operator, value, negate, exists, attribute, componentId, zone, valueExists} = params;
  const z = zone as Zone;
  const and_ = z.components[componentId].data.filter!.and_;
  resetFiltersBelow({id: componentId, zone: z, indexOffset: 1});

  if (valueExists || exists) {
    // exists filter removed if value is already set
    if ('exists' in (and_[attribute] || {})) {
      delete and_[attribute]['exists'];
    }
    // setting just an exists filter if exists is true
    if (exists) {
      and_[attribute] = {};
      and_[attribute]['exists'] = { negate: negate };
    // setting a value filter from an input
    } else if (operator === 'in_list') {
      and_[attribute] = {};
      and_[attribute]['in_list'] = { value: value, negate: negate };
    } else {
      and_[attribute] = {
        ...and_[attribute],
        [operator]: { value, negate }
      };
    }
  } else {
    if (operator in (and_[attribute] || {})) {
      delete and_[attribute][operator];
    }
  }
  if (attribute in and_ && isEmptyObject(and_[attribute])) {
    delete and_[attribute];
  }
}

export function filterListener(params: {
  // filter location
  attribute: string,
  componentId: string,
  operators: string[],
  // filter state
  zone: Zone,
  setValue: any,
  setExists?: any,
  setNegate?: any,
  emptyValue: any,
  setDisabled: any,
  zoneToValue: (filterValue: any, exisitingValue?: any) => any
}, dependencies: any[]) {
  const {attribute, componentId, operators, zone, setValue, setDisabled, setNegate, setExists, zoneToValue} = params;

  useEffect(() => {
    const aboveComponents = getComponentsAbove(componentId, zone.order);
    let disabled = false;
    let readyToBreak = 0;
    let value = params.emptyValue;
    let negate = false;
    let exists = false;
  
    for (const currentId of aboveComponents) {
      const componentData = zone.components[currentId].data;
      const and_ = componentData.filter!.and_;
      // ignore pass throughs
      if (and_ && attribute in and_ && !componentData.filterPassThrough) {
        const disableCondition = (currentId !== componentId);
        // checks setExists as only used for text input filters
        if (setExists && 'exists' in and_[attribute]) {
          exists = true;
          disabled = disableCondition;
          negate = and_[attribute]['exists'].negate || negate;
          break;
        } else {
          for (const op of operators) {
            if (op in and_[attribute]) {
              const filter = and_[attribute][op];
              disabled = disableCondition;
              negate = filter.negate || negate;
              value = zoneToValue(filter.value, value);
              // break if all operators have been checked
              if (readyToBreak === operators.length-1) break;
              readyToBreak++;
            }
          }
        }
      }
    }
    setValue(value);
    setDisabled(disabled);
    if (setExists) setExists(exists);
    if (setNegate) setNegate(negate);
  }, dependencies);
}

export function addSubFilter(params: {
  id: string,
  filter: object,
  zone: object
}) {
  const {id, filter, zone} = params;
  const z = zone as Zone;
  const f = filter as Filter;
  resetFiltersBelow({id: id, zone: z!});
  z.components[id].data.subFilter = f;
}

export function resetZone(params: {zone: Zone, setZone: any}) {
  const {zone, setZone} = params;
  resetAllFilters(zone);
  setZone({...zone});
}
