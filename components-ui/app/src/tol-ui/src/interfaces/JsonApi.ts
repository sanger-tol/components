/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export interface IJsonApiData {
  type: string;
  id: string;
  attributes?: Record<string, unknown>;
  relationships?: Record<string, unknown>;
  __meta?: Record<string, unknown>;
  __includedLookup?: Record<string, unknown>;
}

export type TJsonApiData = IJsonApiData | IJsonApiData[];

export interface IJsonApiResponseData {
  data: TJsonApiData;
  included?: TJsonApiData[];
  meta: Record<string, unknown>;
  errors?: any[];
}

export interface IJsonApiResponse {
  data: IJsonApiResponseData;
}