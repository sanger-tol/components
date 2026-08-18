/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useMemo, useState } from "react";
import { API_METHODS, numberWithSpaces, IRemoteTarget, IZone, TFilterOrUndefined, generateFilter, filterHasUpdated, ATTRIBUTE_STATS_CARDS, ATTRIBUTE_STATS_KEYS, NUMERIC_PYTHON_TYPES} from "..";

interface PAttributeStatsBox extends IRemoteTarget {
  /** 
  * Attribute field id used to look up metadata and fetch stats. 
  */
  attributeId: string;
  /** 
  * Optional component id used to derive the compounded zone filter. 
  */
  componentId?: string;
  /** 
  * Optional zone context used to build the scoped filter for stats calls. 
  */
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
  const [loading, setLoading] = useState(false);
  const [statsError, setStatsError] = useState<string>("");
  const [filter, setFilter] = useState<TFilterOrUndefined>({});

  useEffect(() => {
    setIsNumeric(false);
    setStats(null);
    setLoading(false);
    setStatsError("");

    dataSource.getEntityMeta().then((meta) => {
      const attribute = meta.flatAttributes[objectType][field];
      if (!attribute) return;
      const pythonType = (attribute.python_type ?? "").toLowerCase();
      setIsNumeric(NUMERIC_PYTHON_TYPES.has(pythonType));
    });
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
    if (!isNumeric || stats) return;

    setStatsError("");
    setLoading(true);
    const params: any = {
      stats: ATTRIBUTE_STATS_KEYS.join(","),
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
        const statsPayload = res?.data?.meta?.stats?.[field];
        if (!statsPayload) {
          setStatsError("No stats available.");
          return;
        }
        setStats(statsPayload);
      })
      .catch((error: any) => {
        setStatsError(error?.message ?? "Stats request failed");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [dataSource, field, filter, isNumeric, objectType, stats]);

  const statsContents = useMemo(() => {
    if (!stats) return null;

    return (
      <div className="tol-attribute-tooltip-stats-grid">
        {ATTRIBUTE_STATS_CARDS.map(({ key, label, className }) => {
          const rawValue = stats[key];
          const displayValue =
            rawValue === undefined || rawValue === null || Number.isNaN(Number(rawValue))
              ? "None"
              : numberWithSpaces(Number(rawValue));

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
  }, [isNumeric, loading, stats, statsError]);

  if (!isNumeric || statsError) return null;

  return (
    <div className="tol-attribute-tooltip-stats-box">
      <div className="tol-attribute-tooltip-stats-header">
        <span className="tooltip-key">
          Statistics
        </span>
      </div>
      <div
        onClick={(event) => event.stopPropagation()}
        className="tol-tm-md"
      >
        {statsContents}
      </div>
    </div>
  );
}
