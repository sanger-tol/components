/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export interface IChartData {
  datasets: object[];
  labels: string[];
}

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
  key?: string;
  data: Array<{x: any, y: any}>
}

export type TAggregationResult = IAggregationSegment[];

/**
 * The format aggregations are stored in to be displayed in charts.
 * Derived from `TAggregationResult`, containing a condensed version of `aggs`, and a keys set
 * for utility (displayed along the x axis)
 */
export interface IAggData {
  /** Every unique x value (in the `{x: ..., y: ...}` of an aggregation response) */
  keys: any[];
  /** The actual aggregation data. A condensed version of an aggregation response */
  aggs: {
    [breakDownBy: string]: {
      [x: string]: any
    }
  };
}
