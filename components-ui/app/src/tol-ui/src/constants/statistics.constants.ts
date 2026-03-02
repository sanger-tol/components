/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { TStatisticsType } from "..";

export const STATISTICS_STAT_TYPES: Array<{ label: string; value: TStatisticsType }> = [
  { label: "Count", value: "count" },
  { label: "Minimum", value: "min" },
  { label: "Maximum", value: "max" },
  { label: "Average", value: "avg" },
  { label: "Sum", value: "sum" },
];

export const ATTRIBUTE_STATS_CARDS = [
  { key: "min", label: "Min", className: "tol-attribute-tooltip-stat-card--min" },
  { key: "max", label: "Max", className: "tol-attribute-tooltip-stat-card--max" },
  { key: "avg", label: "Mean", className: "tol-attribute-tooltip-stat-card--avg" },
  { key: "sum", label: "Sum", className: "tol-attribute-tooltip-stat-card--sum" },
] as const;

export const ATTRIBUTE_STATS_KEYS = ATTRIBUTE_STATS_CARDS.map(({ key }) => key);

export const NUMERIC_PYTHON_TYPES = new Set(["int","integer","float","double","decimal","number","long","short"]);
