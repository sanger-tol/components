/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { IFieldMeta, ISortBy, HistogramGrouping } from "..";
import {
  CHART_TYPES,
  COMPONENT_TYPES,
  DATA_LIST_COMPONENT_TYPES,
  STATISTICS_TYPES,
} from "../constants/boards.constants";

export type TChartType = (typeof CHART_TYPES)[keyof typeof CHART_TYPES];
export type TStatisticsType =
  (typeof STATISTICS_TYPES)[keyof typeof STATISTICS_TYPES];
export type TComponentType =
  (typeof COMPONENT_TYPES)[keyof typeof COMPONENT_TYPES];
export type TDataListComponentType =
  (typeof DATA_LIST_COMPONENT_TYPES)[keyof typeof DATA_LIST_COMPONENT_TYPES];

/** Save payload for list-style component configuration. */
export interface IListDataConfigSave extends ISortBy {
  /** Field selection metadata for the list. */
  fieldMeta?: IFieldMeta;
  /** Default number of records displayed per page. */
  pageSize?: number;
}

/** Configuration for board charts. */
export interface IChartConfig {
  breakDownBy: string;
  xAxis: string;
  stacked: boolean;
  grouping: HistogramGrouping;
  chartType: TChartType;
}

/** Configuration for board statistics. */
export interface IStatisticsConfig {
  type?: TStatisticsType;
  field?: string;
}

/** Configuration for board maps. */
export interface IMapConfig {
  longitudeKey: string;
  latitudeKey: string;
  attributeKeys?: string;
}
