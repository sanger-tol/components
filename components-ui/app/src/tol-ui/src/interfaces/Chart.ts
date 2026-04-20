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

/**
 * Aggregation request object sent to ":aggregations".
 * It thus uses the back-end naming conventions
 */
export interface IAggregation {
  x_axis: string;
  y_axis?: string;
  date_interval?: string;
  break_down_by?: string;
  stat?: string;
  stat_field?: string;
  maximum_categories?: number;
}

export interface IAggregationSegment {
  key: string;
  data: Array<{x: any, y: any}>
}

export type TAggregationResult = IAggregationSegment[];
