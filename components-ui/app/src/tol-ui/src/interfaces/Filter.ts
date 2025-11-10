/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export type TFilterOperatorType =
  "exists" | "contains" | "eq" | "gt" | "gte" | "lt" | "lte" | "in_list";

export interface IFilterOperatorOptions {
  value?: any;
  negate?: boolean;
}

type TFilterOperators = Record<TFilterOperatorType, IFilterOperatorOptions>;

// export interface IDescribedFilterOperators {
//   [operator: string]
// }
export interface IDescribedFilterOperator {
  operatorType: TFilterOperatorType;
  prose: string;
}

export interface IAndAttributes {
  // I would love to set this as TFilterOperatorType instead, but that can't be used as an object
  // key. Thus, instead, in code where this is used, `as TFilterOperatorType` must be used.
  [attribute: string]: TFilterOperators;
}

export interface IFilter { // TODO: check usages
  and_?: IAndAttributes;
}

export type TFilterOrUndefined = IFilter | undefined;

export type TDescribedFilters = Record<string, string>;
