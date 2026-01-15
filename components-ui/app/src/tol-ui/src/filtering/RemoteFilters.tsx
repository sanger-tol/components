/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import {
  IRemoteTarget,
  IZone,
  defineZone,
  Filter,
  IFilter,
  AttributeSelector,
  Icon,
  getAttributeDetail,
  generateFilter,
  TFilterOrUndefined,
  deepCopy,
} from "..";


export interface PRemoteFilters extends IRemoteTarget {
  filters?: IFilter;
  setFilters: (filters: TFilterOrUndefined) => void;
  disabledFilterValues?: any;
  open?: boolean;
  setHasPendingChanges?: (hasPendingChanges: boolean) => void;
}

/**
 * @autodoc
 * 
 * RemoteFilters is a component designed for managing and applying filters to data retrieved from
 * a remote `dataSource`. It allows users to dynamically add or remove filters, with support for
 * various attribute types and loading states.
 * 
 * @prop objectType - Remote object type name utilised when fetching aggregation data from the API
 * @prop dataSource - The object type requested when fetching aggregation data from the API
 * @prop filters - Optional initial filters applied to the component; defaults to an empty filter
 * @prop setFilters - State setter for updating the active filters in the parent component
 * @prop disabledFilterValues - Optional array of filter values to disable in the field selction UI
 * @prop open - Boolean indicating whether the filter selection interface is open/visible
 * @prop setHasPendingChanges - Optional state setter for the parent component to indicate whether there are any pending filter changes
 * 
 * @remarks
 * RemoteFilters retrieves entity metadata on mount, displaying it through the filter and 
 * attribute selection UI
 */
export function RemoteFilters(props: PRemoteFilters) {
  const {
    objectType,
    dataSource,
    filters = { and_: {} },
    setFilters,
    disabledFilterValues,
    open,
    setHasPendingChanges,
  } = props;

  const [initialFilters, setInitialFilters] = useState<IFilter>(deepCopy(filters));

  // zone component id pointer
  const filterComponentId = "remote-filters-component";

  // just keeps track of the filter ids and their order
  const [filterKeys, setFilterKeys] = useState(
    Object.keys(filters.and_ || {}),
  );
  const [loading, setLoading] = useState(true);
  const [entityMeta, setEntityMeta] = useState<any>({});

  // repurposed zone so filters correctly interact with the state
  const [filterZone, setFilterZone] = useState<IZone>(
    defineZone("dummy-object-for-remote-filters", [
      { id: filterComponentId, filter: filters },
    ]),
  );

  useEffect(() => {
    dataSource.getEntityMeta().then((em) => {
      setEntityMeta(em);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (open) {
      const newFilter = generateFilter(filterZone, filterComponentId);
      setFilters(newFilter);
      if (setHasPendingChanges) {
        setHasPendingChanges(
          JSON.stringify(newFilter) !== JSON.stringify(initialFilters),
        );
      }
    }
  }, [filterZone]);

  useEffect(() => {
    setInitialFilters(deepCopy(filters));
  }, [open]);

  const removeFilter = (attribute: string) => {
    // update the filters that are shown
    const f = filterKeys.filter((str) => str !== attribute);
    setFilterKeys(f);

    // update the zone state which builds the filter ready for the api
    if (filterZone.components[filterComponentId].data.filter?.and_?.[attribute]) {
      const updatedComponents = { ...filterZone.components };
      delete updatedComponents[filterComponentId].data.filter?.and_?.[attribute];
      setFilterZone({
        ...filterZone,
        components: updatedComponents,
      });
    }
  };

  const onClean = () => {
    if (filterZone.components[filterComponentId].data.filter) {
      filterZone.components[filterComponentId].data.filter.and_ = {};
    }
    if (filterZone.components[filterComponentId].data.defaultFilter) {
      filterZone.components[filterComponentId].data.defaultFilter.and_ = {};
    }
    setFilterZone({ ...filterZone });
  };

  if (loading) return <></>;

  const PLACEHOLDER = "No filters applied, click here to add...";
  const TOOLTIP_CONTENT =
    "A filter already exists in the filtering system. Please remove it before adding this filter.";

  return (
    <div>
      <AttributeSelector
        {...props}
        displaySource
        recommendedFilterAvailable
        renderSearchBySource
        disabledValues={disabledFilterValues}
        placeholder={PLACEHOLDER}
        attribute={filterKeys}
        setAttributes={setFilterKeys}
        populatedFieldType="filter"
        numPopulatedFields={
          Object.keys(
            filterZone.components[filterComponentId].data.filter?.and_ || {},
          ).length
        }
        tooltipContent={TOOLTIP_CONTENT}
        onClean={onClean}
      />
      {filterKeys.map((attribute) => {
        const attributeMeta =
          entityMeta?.flatAttributes?.[objectType]?.[attribute];
        const type =
          attributeMeta?.cardinality < 50 &&
            attributeMeta?.python_type === "str"
            ? "multi"
            : attributeMeta?.python_type;

        return (
          <div className="tol-filters" key={attribute}>
            {`${getAttributeDetail(entityMeta, objectType, attribute, 'display_name')}:`}
            <div className="filter">
              <Filter
                key={`filter-${attribute}`}
                attribute={attribute}
                rename={attributeMeta?.display_name}
                type={type}
                componentId={filterComponentId}
                objectType={objectType}
                dataSource={dataSource}
                zone={filterZone}
                setZone={setFilterZone}
                delay={0}
              />
            </div>
            <span
              className="remove-filter-button"
              onClick={() => removeFilter(attribute)}
            >
              <Icon icon="close" />
            </span>
          </div>
        );
      })}
    </div>
  );
}
