/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export type TFilterOperatorType =
  "exists" | "contains" | "eq" | "gt" | "gte" | "lt" | "lte" | "in_list";

export interface IFilterOperatorOptions {
  value?: any;
  negate?: boolean;
}

export interface IFilterOperators {
  // I would love to set this key as TFilterOperatorType instead, but that can't be used as an
  // object key. Thus, instead, in code where this is used, `as TFilterOperatorType` must be used.
  [operator: string]: IFilterOperatorOptions;
}

export interface IAndAttributes {
  [attribute: string]: IFilterOperators;
}

export interface IFilter {
  /**
   * Stores the filter conditions
   */
  and_?: IAndAttributes;
}

export interface IFilterWithRequiredAnd {
  /**
   * Stores the filter conditions, with the "and_" attribute required.
   */
  and_: IAndAttributes;
}

export type TTranslations = Record<string, string>;

export type TFilterDateRangeValue = [Date, Date] | null;

export interface IFilterDateBounds {
  minDate: Date | null;
  maxDate: Date | null;
}

export type TFilterOrUndefined = IFilter | undefined;

export type TDescribedFilters = Record<string, string[]>;

export type IDBBoardEntityFilter = {
  /**
   * The filter directly related to this entity.
   */
  filter: IFilter;
  /**
   * Whether the filter should be passed on to child entities.
   */
  filter_pass_through?: boolean;
  /**
   * Whether an entity should use the incoming filters from the parent entity.
   */
  filter_exclude_incoming?: boolean;
  /**
   * Whether relationship translations are enabled for the zone.
   */
  relationship_translation?: boolean;
  /**  /**
   * Custom relationship translation path for incoming filters, used at the zone level.
   * This is a single path string (e.g., "specimen.species") that can be used to translate.
   */
  translation_path?: string;
  /**
   * Custom translations for incoming filters, used at the zone level.
   */
  attribute_translations?: TTranslations;
};
