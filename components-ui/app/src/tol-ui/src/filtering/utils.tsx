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


/**
 * Retrieves the identifier of the component located directly above the specified component in the given list.
 * 
 * @param id The identifier of the current component.
 * @param list The list of component identifiers.
 * @returns The identifier of the component above the specified component, or `undefined` if not found.
 */
export function getComponentAbove(id: string, list: string[]) {
  const index = list.indexOf(id);
  return list[index - 1];
}

/**
 * Retrieves the list of component identifiers above the current component in the given list.
 * Includes itself by default.
 * 
 * @param id The identifier of the current component.
 * @param list The list of component identifiers.
 * @param includeSelf Whether to include the current component in the result.
 * @returns An array of component identifiers above the current component.
 */
export function getComponentsAbove(id: string, list: string[], includeSelf: boolean = true) {
  const index = list.indexOf(id);
  return includeSelf ? list.slice(0, index + 1) : list.slice(0, index);
}

/**
 * Retrieves the list of component identifiers below the current component in the given list.
 * 
 * @param id The identifier of the current component.
 * @param list The list of component identifiers.
 * @param indexOffset The number of components to skip below the current component.
 * @returns An array of component identifiers below the current component.
 */
export function getComponentsBelow(
  id: string,
  list: string[],
  indexOffset: number = 0,
) {
  const index = list.indexOf(id);
  // Adding 1, as by default we want the next component
  return index === -1 ? [] : list.slice(index + indexOffset + 1);
}

/**
 * Determines whether a filter has been updated by comparing the existing filter with the incoming filter.
 * If the filter has been updated, it sets the new filter using the provided `setFilter` function.
 * 
 * @param setFilter The function to update the filter.
 * @param exisitingFilter The current filter object.
 * @param incomingFilter The new filter object to compare against.
 * @returns `true` if the filter has been updated; otherwise, `false`.
 */
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

/**
 * Merges two sets of "and" filters, combining their attributes and operations.
 * 
 * @param target The target set of "and" filters to merge into.
 * @param override The set of "and" filters to add to the target.
 * @returns The merged set of "and" filters.
 */
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

/**
 * Merges two filters, combining their "and" attributes if they exist.
 * 
 * @param target The target filter to merge into.
 * @param override The filter to add to the target.
 * @returns The merged filter.
 */
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
 * Generates a compounded filter for a given zone or component.
 * 
 * @param zone - The zone object containing components and their filters.
 * @param id - The identifier of the current component.
 * @param includeOwnSubFilter - A boolean indicating whether to include the component's own sub-filter.
 * @returns The compounded filter object.
 */
export function generateFilter(
  zone?: IZone,
  id?: string,
  includeOwnSubFilter: boolean = false,
  includeSelf: boolean = true,
) {
  if (!zone) return undefined;

  // Get the list of components above the current component in the zone's order, including itself
  const aboveComponents = id ? getComponentsAbove(id, zone.order, includeSelf) : zone.order;

  // Start with zone filter
  let compoundedFilter: IFilter = zone.filter || {};

  // Loop through 'above' components
  for (const currentId of aboveComponents) {
    // Exclude pass throughs except self
    if (
      shouldFilterPassThrough(
        id, currentId, zone.components[currentId].data.filterPassThrough
      )
    ) continue;

    // Get the current filter, using the default filter as a base
    let currentFilter: IFilter = mergeFilters(
      zone.components[currentId].data.defaultFilter || {},
      zone.components[currentId].data.filter || {},
    );

    // Include sub filter if required
    const subFilter = zone.components[currentId].data.subFilter;
    if ((currentId !== id || includeOwnSubFilter) && subFilter) {
      currentFilter = mergeFilters(currentFilter, subFilter);
    }

    // Add current filter to the compounded filter
    compoundedFilter = mergeFilters(compoundedFilter, currentFilter);
  }

  // If the compounded filter has no "and" attributes, return empty object to avoid unnecessary filtering
  if (isEmptyObject(compoundedFilter.and_)) return undefined;

  return compoundedFilter;
}

/**
 * Inserts a value in a list immediately after the specified id.
 * 
 * @param id The identifier after which the value should be inserted.
 * @param value The value to insert.
 * @param list The list in which to insert the value.
 * @returns The updated list with the value inserted.
 */
export function addValueBelow(id: string, value: string, list: string[]) {
  const idIndex = list.indexOf(id);
  list.splice(idIndex + 1, 0, value);
  return list;
}

/**
 * Adds a new component below the specified component in the given zone, and updates the zone's order accordingly.
 * 
 * @param id The identifier of the component below which the new component should be added.
 * @param newId The identifier of the new component to add.
 * @param zone The zone object containing the components and their order.
 */
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

/**
 * Resets the filters of all components below the specified component in the given zone, starting from a certain index offset.
 * 
 * @param params An object containing the parameters for resetting filters below a component.
 * - `id`: The identifier of the component below which filters should be reset.
 * - `zone`: The zone containing the components and their order.
 * - `indexOffset`: The number of components to skip before starting to reset filters (default is 0).
 */
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

/**
 * Resets all filters in the given zone to their default states, including the filters of all components within the zone.
 * 
 * @param zone The zone object containing the components and their filters to reset.
 */
export function resetAllFilters(zone: IZone) {
  zone.filter = deepCopy(zone.defaultFilter!);
  for (const currentId of zone.order) {
    zone.components[currentId].data.filter = deepCopy(
      zone.components[currentId].data.defaultFilter!,
    );
    zone.components[currentId].data.subFilter = undefined;
  }
}

/**
 * Removes a component with the specified identifier from the given zone, and updates the zone's order accordingly.
 * 
 * @param id The identifier of the component to remove.
 * @param zone The zone containing the components and their order.
 */
export function removeComponent(id: string, zone: IZone) {
  delete zone.components[id];
  zone.order = zone.order.filter((currentId) => currentId !== id);
}

/**
 * Sets the filter input for a specific component in a zone.
 * 
 * @param params An object containing the parameters for setting the filter input.
 */
export function setFilterInput(params: {
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
  const and_ = z.components[componentId].data?.filter?.and_ || {};
  resetFiltersBelow({ id: componentId, zone: z });

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

/**
 * Custom hook to listen for changes in the filter state and update the component's values,
 * existence, negation, operator, and disabled state accordingly.
 * 
 * @param params - The parameters for the filter listener updater.
 */
function filterListenerUpdater(params: {
  // Whole filter data
  filter?: IFilter;
  filterPassThrough?: boolean;
  // Filter location
  attribute: string;
  operators: string[];
  // Filter state
  filterMeta: any;
  disableCondition?: boolean;
  // Differentials
  zoneToValue: (filterValue: any, exisitingValue?: any) => any;
  // Whether to update the component's values based on the filter changes, or just update the other variables
  updateValues: boolean;
}) {
  let {
    filter,
    filterPassThrough,
    filterMeta,
    attribute,
    operators,
    disableCondition,
    zoneToValue,
    updateValues,
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
        if (updateValues) filterMeta.values = zoneToValue(filter.value, filterMeta.values);
        filterMeta.exists = false;
        filterMeta.negate = filter.negate || filterMeta.negate;
        filterMeta.currentOperator = operatorToSymbol(op, [filterMeta.values]);
      }
    }
    if (!operatorFound && "exists" in and_[attribute]) {
      filterMeta.exists = true;
      filterMeta.negate = and_[attribute]["exists"].negate || filterMeta.negate;
      filterMeta.disabled = disableCondition;
    }
  }
}

/**
 * Listens for changes in the zone state and updates the component's filter metadata accordingly.
 * 
 * @param params - The parameters for the filter listener.
 * @param dependencies - Optional dependencies for the useEffect hook.
 */
export function filterListener(
  params: {
    // Filter location
    attribute: string;
    componentId: string;
    operators: string[];
    // Filter state and setters
    zone: IZone;
    setValue?: any;
    setExists?: any;
    setNegate?: any;
    setOperator?: any;
    setDisabled?: any;
    emptyValue: any;
    zoneToValue: (filterValue: any, exisitingValue?: any) => any;
    // Whether to only listen to the component's own filter changes, ignoring changes from components above in the hierarchy
    onlyUpdateMyValues?: boolean;
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
    onlyUpdateMyValues = false,
    zoneToValue,
  } = params;

  useEffect(() => {
    // initialise - use an object to take advantage of reference type
    const filterMeta = {
      values: emptyValue,
      exists: false,
      negate: false,
      disabled: false,
    };

    // Perform updates for top-level zone filter
    filterListenerUpdater({
      filter: zone.filter,
      attribute,
      operators,
      filterMeta,
      disableCondition: true,
      zoneToValue,
      /**
       * If onlyUpdateMyValues is true, we only want to update the component's
       * values based on its own filter, not the filters of components above it in the hierarchy
       */
      updateValues: !onlyUpdateMyValues,
    });

    // Be aware of components above in the hierarchy, including itself by default
    const aboveComponents = getComponentsAbove(componentId, zone.order);

    // Loop through 'above' components and perform updates based on their filters, including itself by default
    for (const currentId of aboveComponents) {
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
        /**
         * Always update the current component by its own filter, but only update based on other components
         * filters if onlyUpdateMyValues is false
         */
        updateValues: currentId === componentId || !onlyUpdateMyValues,
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

/**
 * Adds a sub-filter to a specific component in a zone, and resets the filters of all components below it.
 * 
 * @param params An object containing the parameters for adding a sub-filter.
 * - `id`: The identifier of the component to which the sub-filter should be added.
 * - `filter`: The filter object to add as a sub-filter.
 * - `zone`: The zone containing the components and their filters.
 */
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

/**
 * Resets all filters in the given zone to their default states, including the filters of all components within the zone.
 * 
 * @param params An object containing the parameters for resetting the zone.
 * - `zone`: The zone object containing the components and their filters to reset.
 * - `setZone`: A function to update the zone state.
 */
export function resetZone(params: { zone: IZone; setZone: any }) {
  const { zone, setZone } = params;
  resetAllFilters(zone);
  setZone({ ...zone });
}

/**
 * Converts a filter operator symbol to its corresponding string representation used in the filter logic.
 * 
 * @param operator The operator symbol to convert (e.g., "=", "<", ">", etc.).
 * @param values Optional array of values to determine if the operator should be "in_list" or "contains".
 * @returns The string representation of the operator (e.g., "eq", "lt", "gt", etc.).
 */
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

/**
 * Converts a filter operator string to its corresponding symbol representation for display purposes.
 * 
 * @param operator The operator string to convert (e.g., "eq", "lt", "gt", etc.).
 * @param values Optional array of values to determine if the operator should be "in_list" or "contains".
 * @returns The symbol representation of the operator (e.g., "=", "<", ">", etc.).
 */
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
