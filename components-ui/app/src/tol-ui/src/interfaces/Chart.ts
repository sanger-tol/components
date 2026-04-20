/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export interface IChartDataset {
  backgroundColor: string[],
  borderColor: string[],
  colourIndex: number,
  data: number[],
  hoverBackgroundColor: string[],
  id: string,
  label: string,
  order: number,
  pointHoverRadius: number[],
  pointRadius: number[]
}

/** Aggregation request object sent to ":aggregations" */
export interface IAggregation {
  xAxis: string;
  yAxis?: string;
  dateInterval?: string;
  breakDownBy?: string;
  stat?: string;
  statField?: string;
  maximumCategories?: number;
}

export interface IAggregationSegment {
  key: string;
  data: Array<{x: any, y: any}>
}

export type TAggregationResult = IAggregationSegment[];
