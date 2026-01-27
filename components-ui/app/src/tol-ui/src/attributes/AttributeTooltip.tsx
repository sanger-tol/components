/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect,  useState, useMemo, useRef } from "react";
import { FormatTooltip, SourceTag, IRemoteTarget, IconTooltip, API_METHODS, numberWithSpaces } from "..";

export interface PAttributeTooltip extends IRemoteTarget {
  attributeId: string;
  element?: React.ReactNode;
}

export function AttributeTooltip(props: PAttributeTooltip) {
  const { attributeId: field, element, objectType, dataSource } = props;

  const [details, setDetails] = useState<Record<string, React.ReactNode>>({});
  const [isNumeric, setIsNumeric] = useState(false);
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string>("");
  const [statsExpanded, setStatsExpanded] = useState(false);
  const isMountedRef = useRef(true);

  const statsKeys = useMemo(() => ["min", "max", "avg", "sum"], []);

  useEffect(() => {
    isMountedRef.current = true;
    let isMounted = true;
    if (isMounted) {
      setDetails({});
      setIsNumeric(false);
      setStats(null);
      setStatsLoading(false);
      setStatsError("");
      setStatsExpanded(false);

      dataSource.getEntityMeta().then((meta) => {
        const attribute = meta.flatAttributes[objectType][field];
        if (attribute) {
          const pythonType = (attribute.python_type ?? "").toLowerCase();
          const numericTypes = new Set([ "int", "integer", "float", "double", "decimal", "number", "long", "short" ]);
          setIsNumeric(numericTypes.has(pythonType));
          setDetails({
            "Authorative": attribute.authorative,
            "Available on Relationship": attribute.available_on_relationship,
            "Cardinality": attribute.cardinality,
            "Description": attribute.description,
            "Display Name": attribute.display_name,
            "Python Type": attribute.python_type,
            "Source": attribute.source && (
              <SourceTag
                source={attribute.source}
                className="tol-attribute-tooltip-source"
              />
            ),
            "System Name": field
          });
        } else {
          setDetails({"System Name": field});
        }
      });
    }
    return () => {
      isMounted = false;
      isMountedRef.current = false;
    };
  }, [dataSource, field, objectType]);

  const fetchStats = () => {
    if (!isNumeric || statsLoading || stats || statsError) return;

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
  };

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
      min: "Minimum",
      max: "Maximum",
      avg: "Average",
      sum: "Sum",
    };

    return (
      <div className="tol-attribute-tooltip-stats">
        {statsKeys.map((key) => {
          const rawValue = stats[key];
          const displayValue =
            rawValue === undefined || rawValue === null || Number.isNaN(Number(rawValue))
              ? "None"
              : numberWithSpaces(Number(rawValue));

          return (
            <div key={key} className="tol-attribute-tooltip-stat">
              <span className="tooltip-key">{labels[key]}:</span>
              <span className="tooltip-value">{displayValue}</span>
            </div>
          );
        })}
      </div>
    );
  }, [isNumeric, stats, statsError, statsKeys, statsLoading]);

  const Tooltip = <FormatTooltip contents={details} />;

  if (Object.keys(details).length === 0) return <></>;

  const statsBoxLabel = statsLoading
    ? "Loading..."
    : statsError
      ? "Retry"
      : statsExpanded
        ? "Hide"
        : "Click to view";

  const statsBox = isNumeric ? (
    <div
      className="tol-attribute-tooltip-stats-box"
      style={{
        marginTop: "0px",
        padding: "0px 6px",
        borderRadius: "0px",
        background: "var(--tol-overlay)",
      }}
      aria-expanded={statsExpanded}
    >
      <div
        className="tol-attribute-tooltip-stats-header"
        onClick={(event) => {
          event.stopPropagation();
          if (!stats) fetchStats();
          setStatsExpanded((prev) => !prev);
        }}
        style={{ cursor: "pointer" }}
        role="button"
      >
        <span className="tooltip-key">Statistics (Global)</span>
        <span className="tooltip-value">{statsBoxLabel}</span>
      </div>
      {statsExpanded && (
        <div
          onClick={(event) => event.stopPropagation()}
          style={{
            marginTop: "4px",
            paddingLeft: "8px",
            borderLeft: "2px solid var(--tol-border)",
          }}
        >
          {statsContents}
        </div>
      )}
    </div>
  ) : null;

  const tooltipContents = (
    <div>
      {Tooltip}
      {statsBox}
    </div>
  );

  return (
    <IconTooltip
      icon={element}
      contents={tooltipContents}
    />
  );
}
