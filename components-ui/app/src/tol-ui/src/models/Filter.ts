/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

interface IFilterOperators {
  [operator: string]: {
    value?: any;
    negate?: boolean;
  };
}

export interface IAndAttributes {
  [attribute: string]: IFilterOperators;
}

export interface IFilter { // TODO: check usages
  and_?: IAndAttributes;
}

export type TFilterOrUndefined = IFilter | undefined;
