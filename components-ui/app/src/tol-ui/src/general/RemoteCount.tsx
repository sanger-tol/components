/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import {
  generateFilter,
  filterHasUpdated,
  resetFiltersBelow,
  Placeholder,
  numberWithSpaces,
  useEffectUpdate,
  UtilityBar,
  PUtilityBar,
  TFilterOrUndefined,
  API_METHODS,
  IRemoteTargetAndZone,
} from "..";


/**
 * @autodoc
 * 
 * RemoteCount is a component that retrieves and displays the count of items from a remote
 * `dataSource`, updating dynamically based on applied filters and selected zones.
 * 
 * @prop id - Unique identifier for this count instance, utilized in the utility bar and various internal functions
 * @prop objectType - Specifies the type of remote object for count retrieval via the API
 * @prop dataSource - The data source used to execute API requests to gather the item count
 * @prop zone - Current filter zone object that influences the data fetched
 * @prop setZone - Function to update the zone state, affecting the filters applied below this instance
 * @prop utilityBarConfig - Optional configuration for the utility bar rendered above the count display, including additional action buttons
 */

export interface PRemoteCount extends IRemoteTargetAndZone {
  id: string;
  utilityBarConfig?: PUtilityBar;
}

export function RemoteCount(props: PRemoteCount) {
  const { id, objectType, dataSource, zone, setZone, utilityBarConfig } = props;
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<TFilterOrUndefined>({});

  useEffect(() => {
    const compoundedFilter = generateFilter(zone, id);
    // will trigger [filter] useEffect if update has occured
    if (filterHasUpdated(setFilter, filter, compoundedFilter)) {
      resetFiltersBelow({ id: id, zone: zone! });
      setZone({ ...zone });
    }
  }, [zone]);

  useEffectUpdate(() => {
    setLoading(true);
    dataSource
      .custom({
        method: API_METHODS.GET,
        resource: `${objectType}:count`,
        params: {
          filter: filter,
        },
      })
      .then((res: any) => {
        const total = res.data.meta.total;
        setCount(total);
        setLoading(false);
      })
      .catch((error: any) => {
        setLoading(false);
        setError(error.message);
        console.error(error.message);
      });
  }, [filter]);

  const Contents = () => {
    if (error !== "") {
      return <Placeholder errorMessage={error} />;
    }
    if (loading) {
      return <Placeholder loader />;
    }
    return (
      <div id={id} className="tol-count">
        <h1 className="count">{numberWithSpaces(count)}</h1>
        <div
          className={!utilityBarConfig ? "faded" : "faded count-utility-bar"}
          aria-hidden="true"
        >
          <h1>{count}</h1>
        </div>
      </div>
    );
  };

  return (
    <>
      <UtilityBar id={id} {...utilityBarConfig} />
      <div className="tol-component-contents with-offset">
        <Contents />
      </div>
    </>
  );
}
