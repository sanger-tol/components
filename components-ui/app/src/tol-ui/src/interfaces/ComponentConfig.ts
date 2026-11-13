/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { Dispatch, SetStateAction } from "react";
import type { IFieldMeta, IDefaultPageSize, IDefaultSortBy, HistogramGrouping } from "..";
import {
  CHART_TYPES,
  COMPONENT_TYPES,
  STATISTICS_TYPES,
} from "../constants/boards.constants";

export type TChartType = (typeof CHART_TYPES)[keyof typeof CHART_TYPES];
export type TStatisticsType =
  (typeof STATISTICS_TYPES)[keyof typeof STATISTICS_TYPES];
export type TComponentType =
  (typeof COMPONENT_TYPES)[keyof typeof COMPONENT_TYPES];

/** Default shape for component-specific options when a component doesn't type its own. */
export type TDefaultAdditionalOptions = Record<string, any>;

/** Save payload for list-style component configuration, extended with component-specific options. */
export type TListDataConfigSave<TAdditionalOptions = TDefaultAdditionalOptions> =
  IDefaultSortBy & IDefaultPageSize & {
    /** Field selection metadata for the list. */
    fieldMeta?: IFieldMeta;
  } & TAdditionalOptions;

/** Props for content that edits a component's additional options. */
export interface TAdditionalOptionsContent<TAdditionalOptions> {
  /** Current draft values for the component-specific options. */
  additionalOptions: TAdditionalOptions;
  /** Updates the component-specific option draft. */
  setAdditionalOptions: (options: TAdditionalOptions) => void;
}

/** Props for content that edits a selected field's draft options. */
export interface TFieldOptionsContent {
  /** Identifier of the field being configured. */
  attributeId: string;
  /** Draft field metadata shared with the configuration drawer. */
  fieldMeta: IFieldMeta;
  /** Updates the draft metadata without persisting it until the drawer is saved. */
  setFieldMeta: Dispatch<SetStateAction<IFieldMeta>>;
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
