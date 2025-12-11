/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { IDataObject } from "..";


export interface IIncludedLookup {
  [objectType: string]: {
    [id: string]: IDataObject;
  };
}

export interface IJsonApiDataExtra {
  __includedLookup?: IIncludedLookup;
  __meta?: Record<string, unknown>;
}

export interface IJsonApiData extends IJsonApiDataExtra {
  type: string;
  id: string;
  attributes?: Record<string, unknown>;
  relationships?: Record<string, unknown>;
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