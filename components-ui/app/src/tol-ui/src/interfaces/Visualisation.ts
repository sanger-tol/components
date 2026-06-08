/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  HistogramGrouping,
  COMPONENT_TYPES,
  STATISTICS_TYPES,
  CHART_TYPES,
} from "..";

export type TChartType = (typeof CHART_TYPES)[keyof typeof CHART_TYPES];
export type TStatisticsType =
  (typeof STATISTICS_TYPES)[keyof typeof STATISTICS_TYPES];
export type TComponentType =
  (typeof COMPONENT_TYPES)[keyof typeof COMPONENT_TYPES];

export interface IChartConfig {
  breakDownBy: string;
  xAxis: string;
  stacked: boolean;
  grouping: HistogramGrouping;
  chartType: TChartType;
}

export interface IStatisticsConfig {
  type?: TStatisticsType;
  field?: string;
}

export interface IMapConfig {
  longitudeKey: string;
  latitudeKey: string;
  attributeKeys?: string;
}
