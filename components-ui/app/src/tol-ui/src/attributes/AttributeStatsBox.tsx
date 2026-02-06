/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { API_METHODS, numberWithSpaces, IRemoteTarget } from "..";

interface PAttributeStatsBox extends IRemoteTarget {
  attributeId: string;
}

export function AttributeStatsBox(props: PAttributeStatsBox) {
  const { attributeId: field, objectType, dataSource } = props;

  const [isNumeric, setIsNumeric] = useState(false);
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string>("");
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

  const fetchStats = useCallback(() => {
    if (!isNumeric || statsLoading || stats) return;

    setStatsError("");
    setStatsLoading(true);
    dataSource.custom({
      method: API_METHODS.GET,
      resource: `${objectType}:stats`,
      params: {
        stats: statsKeys.join(","),
        stats_fields: field,
      },
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
  }, [
    dataSource,
    field,
    isNumeric,
    objectType,
    stats,
    statsKeys,
    statsLoading,
  ]);

  useEffect(() => {
    if (!isNumeric) return;
    fetchStats();
  }, [fetchStats, isNumeric]);

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

    const labels: Record<string, string> = {
      min: "Min",
      max: "Max",
      avg: "Mean",
      sum: "Sum",
    };

    const order = ["min", "max", "avg", "sum"] as const;
    const classByKey: Record<(typeof order)[number], string> = {
      min: "tol-attribute-tooltip-stat-card--min",
      max: "tol-attribute-tooltip-stat-card--max",
      avg: "tol-attribute-tooltip-stat-card--avg",
      sum: "tol-attribute-tooltip-stat-card--sum",
    };

    const formatStatValue = (value: number) => {
      if (!Number.isFinite(value)) return "None";
      const isWhole = Number.isInteger(value);
      const rounded = isWhole ? value : Number(value.toFixed(2));
      return numberWithSpaces(rounded);
    };

    return (
      <div className="tol-attribute-tooltip-stats-grid">
        {order.map((key) => {
          const rawValue = stats[key];
          const displayValue =
            rawValue === undefined || rawValue === null || Number.isNaN(Number(rawValue))
              ? "None"
              : formatStatValue(Number(rawValue));

          return (
            <div
              key={key}
              className={`tol-attribute-tooltip-stat-card ${classByKey[key]}`}
            >
              <span className="tol-attribute-tooltip-stat-label">{labels[key]}</span>
              <span className="tol-attribute-tooltip-stat-value">{displayValue}</span>
            </div>
          );
        })}
      </div>
    );
  }, [isNumeric, stats, statsError, statsKeys, statsLoading]);

  if (!isNumeric) return null;

  return (
    <div
      className="tol-attribute-tooltip-stats-box"
      style={{
        marginTop: "0px",
        padding: "3px 12px 14px",
        borderRadius: "6px",
        background: "var(--tol-grey-translucent)",
      }}
    >
      <div className="tol-attribute-tooltip-stats-header">
        <span className="tooltip-key">Statistics (Global)</span>
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
