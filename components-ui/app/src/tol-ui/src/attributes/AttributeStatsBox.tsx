/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useMemo, useRef, useState } from "react";
import { API_METHODS, numberWithSpaces, IRemoteTarget, IZone, TFilterOrUndefined, generateFilter, filterHasUpdated } from "..";

/**
 * Props for `AttributeStatsBox`.
 * Extends `IRemoteTarget` to access the datasource and entity type context.
 */
interface PAttributeStatsBox extends IRemoteTarget {
  /** Attribute field id used to look up metadata and fetch stats. */
  attributeId: string;
  /** Optional component id used to derive the compounded zone filter. */
  componentId?: string;
  /** Optional zone context used to build the scoped filter for stats calls. */
  zone?: IZone;
}

/**
 * Renders summary statistics (min, max, mean, sum) for numeric attributes.
 *
 * Resolves attribute metadata first and only renders for numeric fields.
 * Builds a compounded filter from `zone` + `componentId` when provided.
 * Fetches stats from `${objectType}:stats` and formats values for display.
 */
export function AttributeStatsBox(props: PAttributeStatsBox) {
  const { attributeId: field, objectType, dataSource, componentId, zone } = props;

  const [isNumeric, setIsNumeric] = useState(false);
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string>("");
  const [filter, setFilter] = useState<TFilterOrUndefined>(undefined);
  const isMountedRef = useRef(true);

  const statsKeys = useMemo(() => ["min", "max", "avg", "sum"], []);

  useEffect(() => {
    isMountedRef.current = true;
    setIsNumeric(false);
    setStats(null);
    setStatsLoading(false);
    setStatsError("");

    dataSource.getEntityMeta().then((meta) => {
      const attribute = meta.flatAttributes[objectType][field];
      if (!attribute) return;
      const pythonType = (attribute.python_type ?? "").toLowerCase();
      const numericTypes = new Set(["int","integer","float","double","decimal","number","long","short"]);
      setIsNumeric(numericTypes.has(pythonType));
    });

    return () => {
      isMountedRef.current = false;
    };
  }, [dataSource, field, objectType]);

  useEffect(() => {
    if (!zone || !componentId) {
      setFilter(undefined);
      return;
    }
    const compoundedFilter = generateFilter(zone, componentId);
    filterHasUpdated(setFilter, filter, compoundedFilter);
  }, [zone, componentId]);

  useEffect(() => {
    setStats(null);
    setStatsError("");
  }, [filter]);

  useEffect(() => {
    if (!isNumeric || statsLoading || stats) return;

    setStatsError("");
    setStatsLoading(true);
    const params: any = {
      stats: statsKeys.join(","),
      stats_fields: field,
    };
    if (filter !== undefined) {
      params.filter = filter;
    }
    dataSource.custom({
      method: API_METHODS.GET,
      resource: `${objectType}:stats`,
      params,
    })
      .then((res: any) => {
        if (!isMountedRef.current) return;
        const statsPayload = res?.data?.meta?.stats?.[field];
        if (!statsPayload) {
          setStatsError("No stats available.");
          return;
        }
        setStats(statsPayload);
      })
      .catch((error: any) => {
        if (!isMountedRef.current) return;
        setStatsError(error?.message ?? "Stats request failed");
      })
      .finally(() => {
        if (!isMountedRef.current) return;
        setStatsLoading(false);
      });
  }, [dataSource, field, filter, isNumeric, objectType, stats, statsKeys, statsLoading]);

  const statsContents = useMemo(() => {
    if (!isNumeric) return null;

    if (statsLoading) {
      return <span className="tooltip-value-none">Loading...</span>;
    }

    if (statsError) {
      return <span className="tooltip-value-none">{statsError}</span>;
    }

    if (!stats) {
      return null;
    }

    const statCards = [
      { key: "min", label: "Min", className: "tol-attribute-tooltip-stat-card--min" },
      { key: "max", label: "Max", className: "tol-attribute-tooltip-stat-card--max" },
      { key: "avg", label: "Mean", className: "tol-attribute-tooltip-stat-card--avg" },
      { key: "sum", label: "Sum", className: "tol-attribute-tooltip-stat-card--sum" },
    ] as const;

    const formatStatValue = (value: number) => {
      if (!Number.isFinite(value)) return "None";
      const isWhole = Number.isInteger(value);
      const rounded = isWhole ? value : Number(value.toFixed(2));
      return numberWithSpaces(rounded);
    };

    return (
      <div className="tol-attribute-tooltip-stats-grid">
        {statCards.map(({ key, label, className }) => {
          const rawValue = stats[key];
          const displayValue =
            rawValue === undefined || rawValue === null || Number.isNaN(Number(rawValue))
              ? "None"
              : formatStatValue(Number(rawValue));

          return (
            <div
              key={key}
              className={`tol-attribute-tooltip-stat-card ${className}`}
            >
              <span className="tol-attribute-tooltip-stat-label">{label}</span>
              <span className="tol-attribute-tooltip-stat-value">{displayValue}</span>
            </div>
          );
        })}
      </div>
    );
  }, [isNumeric, stats, statsError, statsKeys, statsLoading]);

  if (!isNumeric) return null;

  return (
    <div className="tol-attribute-tooltip-stats-box">
      <div className="tol-attribute-tooltip-stats-header">
        <span className="tooltip-key">
          Statistics
        </span>
      </div>
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          marginTop: "8px",
        }}
      >
        {statsContents}
      </div>
    </div>
  );
}
