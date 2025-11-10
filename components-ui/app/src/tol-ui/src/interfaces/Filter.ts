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

export interface IAndAttributes {
  [attribute: string]: TFilterOperators;
}

export interface IFilter { // TODO: check usages
  and_?: IAndAttributes;
}

export type TFilterOrUndefined = IFilter | undefined;
