/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect } from 'react';
import { Zone, Filter, defineComponent } from '../board/Utils';
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
  return output as Filter;
}

export function generateFilter(id: string, zone?: object, useSubFilter?: boolean) {
  if (zone === undefined) return undefined;
  const z = zone as Zone;
  const aboveComponents = getComponentsAbove(id, z.order);
  let compoundedFilter = {};
  // loop through above components
  for (const currentId of aboveComponents) {
    // exclude pass throughs except self
    if (z.components[currentId].data.filterPassThrough && id !== currentId) {
      continue;
    }
    let currentFilter: any = z.components[currentId].data.filter!.and_;
    // include sub filter if required
    const subFilter = z.components[currentId].data.subFilter;
    if ((currentId !== id || useSubFilter) && subFilter) {
      currentFilter = mergeAndFilters(currentFilter, subFilter.and_);
    }
    compoundedFilter = mergeAndFilters(currentFilter, compoundedFilter);
  }
  return {
    and_: compoundedFilter
  };
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
  for (const currentId of zone.order) {
    zone.components[currentId].data.filter = deepCopy(zone.components[currentId].data.defaultFilter!);
    zone.components[currentId].data.subFilter = undefined;
  }
}

export function setFilter(params: {
  // and_ filter attributes
  operator: string,
  value: any,
  negate: boolean,
  // filter location
  attribute: string,
  componentId: string,
  // filter state
  zone: object,
  // differentials
  valueExists: any
}) {
  const {operator, value, negate, attribute, componentId, zone, valueExists} = params;
  const z = zone as Zone;
  const and_ = z.components[componentId].data.filter!.and_;
  resetFiltersBelow({id: componentId, zone: z, indexOffset: 1});

  if (valueExists) {
    and_[attribute] = {
      ...and_[attribute],
      [operator]: { value, negate }
    };
  } else {
    if (operator in (and_[attribute] || {})) {
      delete and_[attribute][operator];
    }
    if (attribute in and_ && isEmptyObject(and_[attribute])) {
      delete and_[attribute];
    }
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
  emptyValue: any,
  setDisabled: any,
  zoneToValue: (filterValue: any, exisitingValue?: any) => any
}, dependencies: any[]) {
  const {attribute, componentId, operators, zone, setValue, setDisabled, zoneToValue} = params;

  useEffect(() => {
    const aboveComponents = getComponentsAbove(componentId, zone.order);
    let isDisabled = false;
    let readyToBreak = 0;
    let value = params.emptyValue;
  
    for (const currentId of aboveComponents) {
      const and_ = zone.components[currentId].data.filter!.and_;
      if (and_ && attribute in and_) {
        for (const op of operators) {
          if (op in and_[attribute]) {
            const filter = and_[attribute][op];
            isDisabled = (currentId !== componentId);
            value = zoneToValue(filter.value, value);
            // break if all operators have been checked
            if (readyToBreak === operators.length-1) break;
            readyToBreak++;
          }
        }
      }
    }
    setValue(value);
    setDisabled(isDisabled);
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
