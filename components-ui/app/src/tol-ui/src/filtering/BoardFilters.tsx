/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { IZone } from "../boards/Utils";
import RemoteFilters from "./RemoteFilters";
import { Drawer } from "../general";
import { generateFilter, resetFiltersBelow } from "./Utils";
import { deepCopy } from "../general/Utils";
import { TsDataSource } from "..";
import { BOARD_URL_PREFIX } from "../constants";

export interface Props {
  id: string;
  zone: IZone;
  setZone: any;
  entityType: string; // e.g. component type or zone
  endpoint: string;
  baseUrl?: string;
  open: boolean;
  setOpen: any;
}

function BoardFilters(props: Props) {
  const { id, zone, setZone, entityType, endpoint, open, setOpen } = props;
  const ds = new TsDataSource();

  // the fixed filter present on the component
  const [filters, setFilters] = useState(
    deepCopy(
      entityType === "zone"
        ? zone.defaultFilter
        : zone.components[id].data.defaultFilter,
    ),
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
        entityType === "zone"
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
  }, [open]);

  const onSave = (filter: any) => {
    if (entityType === "zone") {
      zone.filter = deepCopy(filter);
      zone.defaultFilter = deepCopy(filter);
    } else {
      zone.components[id].data.filter = deepCopy(filter);
      zone.components[id].data.defaultFilter = deepCopy(filter);
    }
    resetFiltersBelow({ id: id, zone: zone });
    setZone({ ...zone });
    setOpen(false);

    ds.upsert({
      objectType: `${BOARD_URL_PREFIX}/${entityType}`,
      payload: [
        {
          type: entityType,
          id: id,
          attributes: {
            filter: filter,
          },
        },
      ],
    });
  };

  return (
    <div>
      <Drawer
        title={`Filtering on a ${endpoint} ${entityType}`}
        open={open}
        setOpen={setOpen}
      >
        <RemoteFilters
          {...props}
          filters={filters}
          onSave={onSave}
          disabledFilterValues={disabledFilterValues}
        />
      </Drawer>
    </div>
  );
}

export default BoardFilters;
