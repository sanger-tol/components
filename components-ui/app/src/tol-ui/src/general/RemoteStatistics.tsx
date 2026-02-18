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
  TStatisticsType,
  normaliseNumber
} from "..";

export interface PRemoteStatistics extends IRemoteTargetAndZone {
  /**
   * Unique identifier for this count instance, utilized in the utility bar and various internal functions
   */
  id: string;
  /**
   * Optional configuration for the utility bar rendered above the count display, including additional action buttons
   */
  utilityBarConfig?: PUtilityBar;
  /**
   * The statistic to display - "count", "min", "max", "avg", or "sum"
   */
  type?: TStatisticsType;
  /**
   * The field to apply the statistic to (required when type is not "count")
   */
  field?: string;
}

/**
 * @autodoc
 * 
 * RemoteStatistics retrieves and displays count or stats from a remote dataSource,
 * updating based on applied filters and selected zones.
 */
export function RemoteStatistics(props: PRemoteStatistics) {
  const { id, objectType, dataSource, zone, setZone, utilityBarConfig, type = "count", field } = props;
  const [value, setValue] = useState<number>(0);
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
    setError("");

    if (type !== "count" && (!field || field.trim() === "")) {
      setError("No field selected.");
      setLoading(false);
      return;
    }

    const resource =
      type === "count" ? `${objectType}:count` : `${objectType}:stats`;

    const params: any =
      type === "count"
        ? { filter }
        : {
            filter,
            stats: type,
            stats_fields: field!.trim(),
          };

    dataSource
      .custom({
        method: API_METHODS.GET,
        resource,
        params,
      })
      .then((res: any) => {
        if (type === "count") {
          const total = res?.data?.meta?.total;
          if (total === undefined || total === null || Number.isNaN(Number(total))) {
            setError("Unable to read total count.");
            return;
          }
          setValue(Number(total));
          return;
        }

        const stats = res?.data?.meta?.stats || {};
        const statValue = stats?.[field!.trim()]?.[type];

        if (
          statValue === undefined ||
          statValue === null ||
          Number.isNaN(Number(statValue))
        ) {
          setError("No stats available for the selected field.");
          return;
        }

        setValue(Number(statValue));
      })
      .catch((error: any) => {
        console.error(error?.message);
        setError(error?.message ?? "Request failed");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [filter, type, field]);

  const Contents = () => {
    if (error !== "") {
      return <Placeholder errorMessage={error} />;
    }
    if (loading) {
      return <Placeholder loader />;
    }

    return (
      <div id={id} className="tol-count">
        <h1 className="count">{normaliseNumber(value)}</h1>
        <div
          className={!utilityBarConfig ? "faded" : "faded count-utility-bar"}
          aria-hidden="true"
        >
          <h1>{value}</h1>
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
