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

interface IFilterOperators {
  // I would love to set this key as TFilterOperatorType instead, but that can't be used as an
  // object key. Thus, instead, in code where this is used, `as TFilterOperatorType` must be used.
  [operator: string]: IFilterOperatorOptions;
}

export interface IAndAttributes {
  [attribute: string]: IFilterOperators;
}

export interface IFilter {
  and_?: IAndAttributes;
}

export type TFilterOrUndefined = IFilter | undefined;

export type TDescribedFilters = Record<string, string[]>;
