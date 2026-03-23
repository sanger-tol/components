/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { HistogramGrouping } from '..';


export type TChart = 'bar' | 'line' | 'scatter';
export type TStatisticsType = "count" | "min" | "max" | "avg" | "sum";

export interface IChartConfig {
  breakDownBy: string,
  xAxis: string,
  stacked: boolean,
  grouping: HistogramGrouping,
  chartType: TChart,
}

export interface IStatisticsConfig {
  type?: TStatisticsType;
  field?: string;
}

export interface IMapConfig {
  longitudeKey: string;
  latitudeKey: string;
}
