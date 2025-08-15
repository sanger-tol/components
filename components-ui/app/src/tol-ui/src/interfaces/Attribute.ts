/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export interface IAllowedCardinality {
  operator: string;
  value: number;
}

export interface IAttributeDetails {
  source?: string;
  rename?: string;
}