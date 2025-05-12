/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Toggle } from "rsuite"
import { InfoTooltip } from "../general"
import { useEffect, useState } from "react";
import { IFetchTargetAndZoneControl } from "../models";
import { upsertComponent, upsertZone } from "../boards/utils";
import RemoteFilters from "./RemoteFilters";
import { Drawer } from "../general";
import { generateFilter, resetFiltersBelow } from "./utils";
import { deepCopy } from "../general/utils";
import { TsDataSource } from "..";


export interface Props extends IFetchTargetAndZoneControl {
  id: string;
  boardObjectType: string; // e.g. component type or zone
  boardDataSource: TsDataSource;
  open: boolean;
  setOpen: any;
}

function BoardFilters(props: Props) {
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
            <InfoTooltip
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

export default BoardFilters;
