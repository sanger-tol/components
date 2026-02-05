/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Toggle } from "rsuite"
import { useEffect, useState } from "react";
import {
  IconTooltip,
  IBoardTargetAndZone,
  upsertComponent,
  upsertZone,
  RemoteFilters,
  Drawer,
  generateFilter,
  resetFiltersBelow,
  deepCopy,
  IFilter,
  AttributeSelector,
  Icon
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
    setOpen
  } = props;

  // the fixed filter present on the component
  const [filters, setFilters] = useState(
    deepCopy(
      boardObjectType === "zone"
        ? zone.defaultFilter
        : zone.components[id].data.defaultFilter,
    ),
  );
  const [attributes, setAttributes] = useState<string[]>(Object.keys(filters.and_ || {}));
  const [passThrough, setPassThrough] = useState<boolean>(false);
  const [filterHasPendingChanges, setFilterHasPendingChanges] = useState(false);

  const hasPendingChanges = (
    filterHasPendingChanges ||
    passThrough !== (boardObjectType === "zone"
      ? false
      : zone.components[id].data.filterPassThrough)
  );

  useEffect(() => {
    setFilters(
      deepCopy(
        boardObjectType === "zone"
          ? zone.defaultFilter
          : zone.components[id].data.defaultFilter,
      ),
    );
    setDisabledFilterValues(
      removeCurrentEntityFiltersForDisabledFilters(
        generateFilter(zone, id, true)?.and_!,
        filters?.and_!,
      ),
    );
    setPassThrough(
      boardObjectType === "zone"
        ? false
        : deepCopy(zone.components[id].data).filterPassThrough,
    );
  }, [open]);

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
      generateFilter(zone, undefined, true)?.and_!,
      filters?.and_!,
    ),
  );

  const onSave = (filter: IFilter, filterPassThrough: boolean) => {
    let upserter = upsertComponent;
    let attributes = {
      filter: filter
    };
    if (boardObjectType === "zone") {
      upserter = upsertZone;
      zone.filter = deepCopy(filter);
      zone.defaultFilter = deepCopy(filter);
    } else {
      zone.components[id].data.filter = deepCopy(filter);
      zone.components[id].data.defaultFilter = deepCopy(filter);
      zone.components[id].data.filterPassThrough = filterPassThrough;
      attributes["filter_pass_through"] = filterPassThrough;
    }
    resetFiltersBelow({ id: id, zone: zone });
    setZone({ ...zone });
    upserter(boardDataSource, id, attributes);
  };

  // Function passed to attribute selector to remove all filters
  const onClean = () => {
    if (zone.components[id].data.filter) {
      zone.components[id].data.filter.and_ = {};
    }
    if (zone.components[id].data.defaultFilter) {
      zone.components[id].data.defaultFilter.and_ = {};
    }
    setZone({ ...zone });
  };

  const removeFilter = (attribute: string) => {
    // update the zone state which builds the filter ready for the api
    if (boardObjectType !== "zone" && zone.components[id].data.filter?.and_?.[attribute]) {
      const updatedComponents = { ...zone.components };
      delete updatedComponents[id].data.filter?.and_?.[attribute];
      setZone({
        ...zone,
        components: updatedComponents,
      });
    }
    setAttributes(attributes.filter((str) => str !== attribute));
  };

  // Element to be passed to each remote filter to allow for individual removal of filters
  const removeCross = ({ attribute }: { attribute: string }) => (
    < span
      className="remove-filter-button"
      onClick={() => { removeFilter(attribute) }}
    >
      <Icon icon="close" />
    </span >
  )

  const PLACEHOLDER = "No filters applied, click here to add...";
  const TOOLTIP_CONTENT =
    "A filter already exists in the filtering system. Please remove it before adding this filter.";

  return (
    <div>
      <Drawer
        title={`Filtering on a ${objectType} ${boardObjectType}`}
        open={open}
        setOpen={setOpen}
        onSave={() => onSave(filters, passThrough)}
        hasPendingChanges={hasPendingChanges}
        onSaveTestId="apply-filter-button"
      >
        <AttributeSelector
          {...props}
          displaySource
          recommendedFilterAvailable
          renderSearchBySource
          disabledValues={disabledFilterValues}
          placeholder={PLACEHOLDER}
          attribute={attributes}
          setAttributes={setAttributes}
          populatedFieldType="filter"
          numPopulatedFields={
            Object.keys(
              zone.components[id]?.data.filter?.and_ || {},
            ).length
          }
          tooltipContent={TOOLTIP_CONTENT}
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
          filters={filters}
          attributes={attributes}
          setFilters={setFilters}
          disabledFilterValues={disabledFilterValues}
          setHasPendingChanges={setFilterHasPendingChanges}
          ExtraElement={removeCross}
        />
      </Drawer>
    </div>
  );
}
