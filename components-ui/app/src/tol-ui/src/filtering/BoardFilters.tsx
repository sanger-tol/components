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
} from ".."


interface Props extends IBoardTargetAndZone {
  id: string;
  open: boolean;
  setOpen: any;
}

export function BoardFilters(props: Props) {
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
  const [passThrough, setPassThrough] = useState<boolean | undefined>(
    boardObjectType === "zone"
        ? true
        : deepCopy(zone.components[id].data).filterPassThrough,
  );

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
        generateFilter(zone, undefined, true)?.and_!,
        filters?.and_!,
      ),
    );
    setPassThrough(
      boardObjectType === "zone"
        ? false
        : deepCopy(zone.components[id].data).filterPassThrough,
    );
  }, [open]);

  const onSave = (filter: any, filterPassThrough: boolean) => {
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
    setOpen(false);
    upserter(boardDataSource, id, attributes);
  };

  return (
    <div>
      <Drawer
        title={`Filtering on a ${objectType} ${boardObjectType}`}
        open={open}
        setOpen={setOpen}
      >
        {boardObjectType !== "zone" ?
          <div className="passThrough-toggle">
            <Toggle
              key="recommended-tick-filter"
              onClick={() => {
                setPassThrough(!passThrough);
                setZone({ ...zone });
              }}
              checked={passThrough}
            />
            <span style={{paddingRight: 6}} onClick={(e) => e.stopPropagation()}>
              Apply filters only to this Component.
            </span>
            <IconTooltip
              contents={
                "This filter does not affect other components in the heirarchy. Filters from above are still applied."
              }
            />
            <hr style={{marginTop: 24}} />
          </div>
        : null
        }
        <RemoteFilters
          {...props}
          filters={filters}
          filterPassThrough={passThrough}
          onSave={onSave}
          disabledFilterValues={disabledFilterValues}
        />
      </Drawer>
    </div>
  );
}
