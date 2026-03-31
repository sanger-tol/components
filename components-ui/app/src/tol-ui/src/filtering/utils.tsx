/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect } from "react";
import {
  IZone,
  defineComponent,
  IFilter,
  IAndAttributes,
  deepCopy,
  isEmptyObject,
  TFilterOrUndefined,
} from "..";


export function getComponentAbove(id: string, list: string[]) {
  const index = list.indexOf(id);
  return list[index - 1];
}

export function getComponentsAbove(id: string, list: string[]) {
  const index = list.indexOf(id);
  return list.slice(0, index + 1);
}

export function getComponentsBelow(
  id: string,
  list: string[],
  indexOffset: number = 0,
) {
  const index = list.indexOf(id);
  return index === -1 ? [] : list.slice(index + indexOffset + 1); // adding 1, as by default we want the next component
}

export function filterHasUpdated(
  setFilter: any,
  exisitingFilter?: object,
  incomingFilter?: object,
) {
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

export function mergeAndFilters(target: IAndAttributes, override: IAndAttributes) {
  const output = deepCopy(target);
  for (const attribute in override) {
    const currentTarget = attribute in output ? output[attribute] : {};
    const currentOverride = override[attribute];
    for (const op in currentOverride) {
      const opTarget = op in currentTarget ? currentTarget[op] : {};
      currentTarget[op] = Object.assign(opTarget, currentOverride[op]);
    }
    output[attribute] = currentTarget;
  }
  return output as IAndAttributes;
}

export function mergeFilters(target: TFilterOrUndefined, override: TFilterOrUndefined) {
  const output = deepCopy(target);
  if (target?.and_ && override?.and_) {
    output.and_ = mergeAndFilters(target.and_, override.and_);
  } else if (override?.and_) {
    output.and_ = deepCopy(override.and_);
  }
  return output as IFilter;
}

/**
 * Removes a specific attribute from an `and_` filter block
 *
 * @param filter - The filter object that may contain an `and_` block
 * @param attr - The attribute key to remove from `filter.and_`
 * 
 * @returns A shallow-cloned filter without the provided attribute when possible; otherwise, the original filter
 */
export function removeAttributeFromFilter(
  filter: IFilter | undefined,
  attr: string,
): IFilter | undefined {
  if (!filter || !("and_" in filter) || !filter.and_ || !(attr in filter.and_)) return filter;
  const next = {
    ...filter,
    and_: { ...filter.and_ },
  };
  delete next.and_[attr];
  return next;
}

/**
 * Removes ignored attributes from the provided `and_` filter block.
 *
 * @param filter - The filter attributes to mutate in place.
 * @param ignoredAttributes - Attribute keys to remove when present.
 */
export function removeIgnoredAttributes(
  filter: IAndAttributes,
  ignoredAttributes: string[] = [],
) {
  if (ignoredAttributes.length === 0) return;
  ignoredAttributes.forEach((attribute) => {
    if (attribute in filter) {
      delete filter[attribute];
    }
  });
}

/**
 * Determines whether a filter operation should pass through based on the provided conditions.
 * 
 * @param filterPassThrough - A boolean indicating if the filter should pass through.
 * @param id - The identifier of the current item being evaluated.
 * @param currentId - The identifier of the item to compare against.
 * @returns `true` if the filter should pass through and the `id` is not equal to `currentId`; otherwise, `false`.
 */
function shouldFilterPassThrough(id?: string, currentId?: string, filterPassThrough?: boolean) {
  return filterPassThrough && id !== currentId
}

/**
 * Replaces attributes in the current filter with their default values if specified.
 * 
 * @param andFilter - The current filter object containing attributes to potentially replace.
 * @param defaultAndFilter - The default filter object containing default attribute values.
 * @param defaultFilterFallback - A boolean indicating whether to use default filters as a fallback.
 * @returns An updated filter object with specified attributes replaced by their default values where applicable.
 */
function useDefaultFilterWhereNecessary(
  andFilter: IAndAttributes,
  defaultAndFilter: IAndAttributes,
  defaultFilterFallback: boolean = false,
): IAndAttributes {
  if (defaultFilterFallback) {
    return mergeAndFilters(andFilter, defaultAndFilter);
  }
  return andFilter;
}

/**
 * Generates a compounded filter for a given zone or component.
 * 
 * @param zone - The zone object containing components and their filters.
 * @param id - The identifier of the current component.
 * @param includeOwnSubFilter - A boolean indicating whether to include the component's own sub-filter.
 * @param defaultFilterFallback - A boolean indicating whether to use default filters as a fallback.
 * @returns The compounded filter object.
 */
export function generateFilter(
  zone: IZone,
  id?: string,
  includeOwnSubFilter: boolean = false,
  defaultFilterFallback: boolean = false,
) {
  if (zone === undefined) return undefined;
  const z = zone as IZone;

  // Get the list of components above the current component in the zone's order, including itself
  const aboveComponents = id ? getComponentsAbove(id, z.order) : z.order;

  // Start with zone filter
  let compoundedFilter: IAndAttributes = z.filter && z.filter.and_ ? z.filter.and_ : {};

  // Loop through 'above' components
  for (const currentId of aboveComponents) {
    // Exclude pass throughs except self
    if (shouldFilterPassThrough(
      id, currentId, z.components[currentId].data.filterPassThrough
    )) {
      continue;
    }

    // Current filter for the currentId
    let currentFilter: IAndAttributes = useDefaultFilterWhereNecessary(
      z.components[currentId].data.filter?.and_ || {},
      z.components[currentId].data.defaultFilter?.and_ || {},
      defaultFilterFallback,
    );

    // Include sub filter if required
    const subFilter = z.components[currentId].data.subFilter;
    if ((currentId !== id || includeOwnSubFilter) && subFilter) {
      currentFilter = mergeAndFilters(currentFilter, subFilter.and_ ?? {});
    }

    // Add current filter to the compounded filter
    compoundedFilter = mergeAndFilters(compoundedFilter, currentFilter);
  }
  return {
    and_: compoundedFilter,
  } as IFilter;
}

// insert a value in a list after an id located
export function addValueBelow(id: string, value: string, list: string[]) {
  const idIndex = list.indexOf(id);
  list.splice(idIndex + 1, 0, value);
  return list;
}

export function addComponentBelow(id: string, newId: string, zone: IZone) {
  defineComponent(
    {
      id: newId,
      filterPassThrough: zone.components[id].data.filterPassThrough,
    },
    zone,
  );
  zone.order = addValueBelow(id, newId, zone.order);
}

export function resetFiltersBelow(params: {
  id: string;
  zone?: object;
  indexOffset?: number;
}) {
  const { zone, indexOffset } = params;
  let id = params.id;
  const z = zone as IZone;
  for (const currentId of getComponentsBelow(id, z.order, indexOffset)) {
    z.components[currentId].data.filter = deepCopy(
      z.components[currentId].data.defaultFilter!,
    );
    z.components[currentId].data.subFilter = undefined;
  }
}

export function resetAllFilters(zone: IZone) {
  zone.filter = deepCopy(zone.defaultFilter!);
  for (const currentId of zone.order) {
    zone.components[currentId].data.filter = deepCopy(
      zone.components[currentId].data.defaultFilter!,
    );
    zone.components[currentId].data.subFilter = undefined;
  }
}

export function removeComponent(id: string, zone: IZone) {
  delete zone.components[id];
  zone.order = zone.order.filter((currentId) => currentId !== id);
}

export function setFilter(params: {
  // and_ filter attributes
  operator: string;
  value?: any;
  negate: boolean;
  exists?: boolean;
  // filter location
  attribute: string;
  componentId: string;
  // filter state
  zone: object;
  // differentials
  valueExists?: any;
}) {
  const {
    operator,
    value,
    negate,
    exists,
    attribute,
    componentId,
    zone,
    valueExists,
  } = params;
  const z = zone as IZone;
  const and_ = z.components[componentId].data.filter!.and_;
  resetFiltersBelow({ id: componentId, zone: z });

  if (and_) {
    if (valueExists || exists) {
      // exists filter removed if value is already set
      if ("exists" in (and_[attribute] || {})) {
        delete and_[attribute]["exists"];
      }
      // setting just an exists filter if exists is true
      if (exists) {
        and_[attribute] = {};
        and_[attribute]["exists"] = { negate: negate };
        // setting a value filter from an input
      } else if (operator === "in_list") {
        and_[attribute] = {};
        and_[attribute]["in_list"] = { value: value, negate: negate };
      } else {
        and_[attribute] = {
          ...and_[attribute],
          [operator]: { value, negate },
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
}

function filterListenerUpdater(params: {
  // whole filter data
  filter?: IFilter;
  filterPassThrough?: boolean;
  // filter location
  attribute: string;
  operators: string[];
  // filter state
  filterMeta: any;
  disableCondition?: boolean;
  // differentials
  zoneToValue: (filterValue: any, exisitingValue?: any) => any;
}) {
  let {
    filter,
    filterPassThrough,
    filterMeta,
    attribute,
    operators,
    disableCondition,
    zoneToValue,
  } = params;

  const and_ = filter?.and_;
  // ignore pass throughs
  if (and_ && attribute in and_ && !filterPassThrough) {
    let operatorFound = false;
    for (const op of operators) {
      if (op in and_[attribute]) {
        operatorFound = true;
        const filter = and_[attribute][op];
        filterMeta.disabled = disableCondition;
        filterMeta.values = zoneToValue(filter.value, filterMeta.values);
        filterMeta.exists = false;
        filterMeta.negate = filter.negate || filterMeta.negate;
        filterMeta.currentOperator = operatorToSymbol(op, [filterMeta.values]);
      }
    }
    if (!operatorFound && "exists" in and_[attribute]) {
      filterMeta.exists = true;
      filterMeta.negate = and_[attribute]["exists"].negate || filterMeta.negate;
      // only disables on exist filter if negate is true
      filterMeta.disabled = filterMeta.negate ? disableCondition : false;
    }
  }
}

export function filterListener(
  params: {
    // filter location
    attribute: string;
    componentId: string;
    operators: string[];
    // filter state
    zone: IZone;
    setValue?: any;
    setExists?: any;
    setNegate?: any;
    setOperator?: any;
    setDisabled?: any;
    emptyValue: any;
    zoneToValue: (filterValue: any, exisitingValue?: any) => any;
    // only sets the value for the current component
    onlyDisplayMyFilter?: boolean;
  },
  dependencies?: any[],
) {
  const {
    attribute,
    componentId,
    operators,
    zone,
    setValue,
    setExists,
    setNegate,
    setOperator,
    setDisabled,
    emptyValue,
    zoneToValue,
    onlyDisplayMyFilter,
  } = params;

  useEffect(() => {
    // initialise - use an object to take advantage of reference type
    const filterMeta = {
      values: emptyValue,
      exists: false,
      negate: false,
      disabled: false,
    };

    // do for the top level filter
    filterListenerUpdater({
      filter: zone.filter,
      attribute,
      operators,
      filterMeta,
      disableCondition: true,
      zoneToValue,
    });

    const aboveComponents = getComponentsAbove(componentId, zone.order);
    for (const currentId of aboveComponents) {

      // Don't update value if onlyDisplayMyFilter is true and it's not the current component
      if (onlyDisplayMyFilter && componentId !== currentId) continue;

      const componentData = zone.components[currentId].data;
      filterListenerUpdater({
        filter: componentData.filter,
        filterPassThrough: shouldFilterPassThrough(
          componentId, currentId, componentData.filterPassThrough
        ),
        attribute,
        operators,
        filterMeta,
        disableCondition: currentId !== componentId,
        zoneToValue,
      });
    }
    if (setValue) setValue(filterMeta.values);
    if (setExists) setExists(filterMeta.exists);
    if (setNegate) setNegate(filterMeta.negate);
    if (setDisabled) setDisabled(filterMeta.disabled);
    if (setOperator && 'currentOperator' in filterMeta)
      setOperator(filterMeta.currentOperator);
  }, [zone, ...(dependencies || [])]);
}
export function addSubFilter(params: {
  id: string;
  filter: IFilter;
  zone: IZone;
}) {
  const { id, filter, zone } = params;
  const z = zone as IZone;
  const f = filter as IFilter;
  resetFiltersBelow({ id: id, zone: z! });
  z.components[id].data.subFilter = f;
}

export function resetZone(params: { zone: IZone; setZone: any }) {
  const { zone, setZone } = params;
  resetAllFilters(zone);
  setZone({ ...zone });
}

export function symbolToOperator(operator: string, values?: string[]) {
  switch (operator) {
    case "=":
      return "eq";
    case "<":
      return "lt";
    case "≤":
      return "lte";
    case ">":
      return "gt";
    case "≥":
      return "gte";
    default:
      if (values && values.length > 1) return "in_list";
      return "contains";
  }
};

export function operatorToSymbol(operator: string, values?: string[]) {
  switch (operator) {
    case "eq":
      return "=";
    case "lt":
      return "<";
    case "lte":
      return "≤";
    case "gt":
      return ">";
    case "gte":
      return "≥";
    default:
      if (values && values.length > 1) return "in_list";
      return "contains";
  }
};
