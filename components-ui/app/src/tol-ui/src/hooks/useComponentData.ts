/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import {
  useQueryData,
  generateFilter,
  filterHasUpdated,
  resetFiltersBelow,
} from "..";
import type { IZone, TFilterOrUndefined } from "..";


/** Parameters for the `useComponentData` hook. */
export interface IUseComponentData<T> {
  /** Unique identifier for the component; used to derive its filter and as part of the query key. */
  id: string;
  /** Fetches and returns the component's data for the given compounded filter. */
  fetchData: (filter: TFilterOrUndefined) => Promise<T>;
  /** The zone the component belongs to, used to derive the compounded filter. Omit if the component doesn't filter by zone. */
  zone?: IZone;
  /**
   * Setter used to persist filter resets on the zone (components below this
   * one are reset whenever this component's compounded filter changes).
   */
  setZone?: (zone: IZone) => void;
  /**
   * Additional parts to append to the query key, so different components/configurations
   * (e.g. a chart's `breakDownBy` and `type`) are cached and refetched independently.
   */
  queryKey?: string[];
  /** Flipping this forces a re-fetch, even if the filter is otherwise unchanged. */
  forceUpdate?: boolean;
  /** Whether to actually run the query; set to `false` to skip fetching entirely. Defaults to `true`. */
  enabled?: boolean;
}

/**
 * Shared data-fetching hook for remote components (charts, tables, statistics, etc.).
 *
 * Keeps a component's filter in sync with its zone, resetting the filters of
 * components below it whenever its own compounded filter changes, then fetches
 * `fetchData` via the shared React Query cache whenever the filter or
 * `forceUpdate` change.
 */
export function useComponentData<T>(params: IUseComponentData<T>) {
  const {
    id,
    fetchData,
    zone,
    setZone,
    queryKey = [],
    forceUpdate,
    enabled = true,
  } = params;

  const [filter, setFilter] = useState<TFilterOrUndefined>({});

  useEffect(() => {
    if (!zone || !setZone) return;
    const compoundedFilter = generateFilter(zone, id);
    // will trigger the query below if an update has occurred
    if (filterHasUpdated(setFilter, filter, compoundedFilter)) {
      resetFiltersBelow({ id, zone });
      setZone({ ...zone });
    }
  }, [zone]);

  const combinedQueryKey = [
    id,
    ...queryKey,
    JSON.stringify(filter),
    String(forceUpdate),
  ];

  const { data, isLoading, isError, error, refetch } = useQueryData<T>(
    combinedQueryKey,
    () =>
      fetchData(filter).catch((err) => {
        console.error("useComponentData fetchData failed:", err);
        throw err;
      }),
    { enabled },
  );

  return {
    filter,
    data,
    isLoading,
    errorMessage: isError ? (error?.message ?? "An error occurred") : undefined,
    refetch,
  };
}
