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
