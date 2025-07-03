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
  IUtilityBar,
  TFilterOrUndefined,
  API_METHODS,
  IRemoteTargetAndZone,
} from "..";


interface Props extends IRemoteTargetAndZone {
  id: string;
  utilityBarConfig?: IUtilityBar;
}

export function RemoteCount(props: Props) {
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
        resource: `${objectType}:count`
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
      <div className={!utilityBarConfig ? "faded" : "faded count-utility-bar"} aria-hidden="true">
        <h1>{count}</h1>
      </div>
    </div>
    )
  }

  return (
    <>
      <UtilityBar id={id} {...utilityBarConfig} />
      <div className="tol-component-contents-with-offset">
        <Contents />
      </div>
    </>
  );
}
