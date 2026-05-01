/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Toggle } from "rsuite"
import { useEffect, useState } from "react";
import {
  IconTooltip,
  IBoardTargetAndZone,
  RemoteFilters,
  Drawer,
  generateFilter,
  resetFiltersBelow,
  deepCopy,
  IFilter,
  AttributeSelector,
  Icon,
  defineZoneWithComponentList,
  IZone,
  upsertCoreBoardEntity,
  BOARDS,
  FILTER_ALREADY_EXISTS,
  NO_FILTERS_APPLIED,
} from ".."


export interface PFilterConfigDrawer extends IBoardTargetAndZone {
  id: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function FilterConfigDrawer(props: PFilterConfigDrawer) {
  const {
    id,
    objectType,
    zone,
    setZone,
    boardObjectType,
    boardDataSource,
    open,
    setOpen,
  } = props;

  // the fixed filter present on the component
  const [prevFilters, setFilters] = useState(
    deepCopy(
      boardObjectType === "zone"
        ? zone.defaultFilter
        : zone.children?.[0]?.[id]?.defaultFilter,
    ),
  );
  const [attributes, setAttributes] = useState<string[]>(Object.keys(prevFilters?.and_ || {}));
  const [passThrough, setPassThrough] = useState<boolean>(false);
  const [filterHasPendingChanges, setFilterHasPendingChanges] = useState(false);
  // Local state for the filter zone if this is a zone level filter, otherwise use the passed zone/setZone
  // const zoneFilterId = "filter-zone-component";
  const [filterZone, setFilterZone] = useState<IZone>(
    defineZoneWithComponentList(
      "dummy-object-for-remote-filters",
      [{ id: id, filter: prevFilters }]
    ) as IZone,
  );

  const hasPendingChanges = (
    filterHasPendingChanges ||
    passThrough !== (boardObjectType === "zone"
      ? false
      : zone.children?.[0]?.[id]?.filterPassThrough)
  );

  useEffect(() => {
    setFilters(
      deepCopy(
        boardObjectType === "zone"
          ? zone.defaultFilter
          : zone.children?.[0]?.[id]?.defaultFilter,
      ),
    );
    setDisabledFilterValues(
      removeCurrentEntityFiltersForDisabledFilters(
        generateFilter(zone, id, true)?.and_!,
        prevFilters?.and_!,
      ),
    );
    setPassThrough(
      boardObjectType === "zone"
        ? false
        : zone.children?.[0]?.[id]?.filterPassThrough || false,
    );
  }, [open]);

  useEffect(() => {
    let newFilter
    if (boardObjectType !== "zone") {
      newFilter = generateFilter(filterZone, id);
    } else {
      newFilter = generateFilter(filterZone, id);
    }
    setFilters(newFilter);
    setFilterHasPendingChanges(
      JSON.stringify(newFilter) !== JSON.stringify(prevFilters),
    );
  }, [zone, filterZone]);

  const removeCurrentEntityFiltersForDisabledFilters = (
    source: object = {},
    remove?: object,
  ) => {
    const keysToRemove = new Set(Object.keys(remove || {}));
    return Object.fromEntries(
      Object.entries(source).filter(([key]) => !keysToRemove.has(key)),
    );
  };

  // getting the disabled filter values (currently all other entity filters)
  const [disabledFilterValues, setDisabledFilterValues] = useState(
    removeCurrentEntityFiltersForDisabledFilters(
      generateFilter(filterZone, undefined, true)?.and_!,
      prevFilters?.and_!,
    ),
  );

  const onSave = (filter: IFilter, filterPassThrough: boolean) => {
    let attributes = {
      filter: filter
    };
    if (boardObjectType === "zone") {
      zone.filter = deepCopy(filter);
      zone.defaultFilter = deepCopy(filter);
    } else {
      zone.children[0][id].filter = deepCopy(filter);
      zone.children[0][id].defaultFilter = deepCopy(filter);
      zone.children[0][id].filterPassThrough = filterPassThrough;
      attributes["filter_pass_through"] = filterPassThrough;
    }
    resetFiltersBelow({ id: id, zone: zone });
    setZone({ ...zone });
    upsertCoreBoardEntity(
      boardObjectType === BOARDS.ZONE ? BOARDS.ZONE : BOARDS.COMPONENT,
      attributes,
      boardDataSource,
      undefined,
      id,
    );
  };

  // Function passed to attribute selector to remove all filters
  const onClean = () => {
    if (boardObjectType === "zone") {
      filterZone.filter = { and_: {} };
      filterZone.defaultFilter = { and_: {} };
    } else {
      if (filterZone.children?.[0]?.[id]?.filter) {
        filterZone.children[0][id].filter.and_ = {};
      }
      if (filterZone.children?.[0]?.[id]?.defaultFilter) {
        filterZone.children[0][id].defaultFilter.and_ = {};
      }
    }
  };

  const removeFilter = (attribute: string) => {
    setAttributes(attributes.filter((str) => str !== attribute));
    setFilters((prev) => {
      const updatedFilter = deepCopy(prev);
      delete updatedFilter.and_?.[attribute];
      return updatedFilter;
    });
    setFilterHasPendingChanges(true);
  };

  // Element to be passed to each remote filter to allow for individual removal of filters
  const removeCross = ({ attribute }: { attribute: string }) => (
    <Icon icon="close" onClick={() => { removeFilter(attribute) }} className="remove-filter-button" />
  );

  return (
    <div>
      <Drawer
        title={`Filtering on a ${objectType} ${boardObjectType}`}
        open={open}
        setOpen={setOpen}
        onSave={() => onSave(prevFilters, passThrough)}
        hasPendingChanges={hasPendingChanges}
        onSaveTestId="apply-filter-button"
      >
        <AttributeSelector
          {...props}
          displaySource
          recommendedFilterAvailable
          renderSearchBySource
          disabledValues={disabledFilterValues}
          placeholder={NO_FILTERS_APPLIED}
          attribute={attributes}
          setAttributes={setAttributes}
          populatedFieldType="filter"
          numPopulatedFields={
            Object.keys(
              zone.children?.[0]?.[id]?.filter?.and_ || {},
            ).length
          }
          tooltipContent={FILTER_ALREADY_EXISTS}
          onClean={onClean}
        />
        {boardObjectType !== "zone" &&
          <div className="pass-through-toggle">
            <Toggle
              key="recommended-tick-filter"
              onClick={() => {
                setPassThrough(!passThrough);
                setZone({ ...zone });
              }}
              checked={passThrough}
            />
            <span style={{ paddingRight: 6 }} onClick={(e) => e.stopPropagation()}>
              Apply filters only to this Component.
            </span>
            <IconTooltip
              contents={
                "This filter does not affect other components in the heirarchy. Filters from above are still applied."
              }
            />
            <hr style={{ marginTop: 24 }} />
          </div>
        }
        <RemoteFilters
          {...props}
          utilityBarConfig={undefined}
          zone={filterZone}
          setZone={setFilterZone}
          componentId={id}
          attributes={attributes}
          ExtraElement={removeCross}
          className={"tol-filter-config-remote-filter"}
        />
      </Drawer>
    </div>
  );
}
