/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type {
  IEntityMeta,
} from "..";

export interface IClientRequestConfig {
  baseURL: string;
  params?: any;
}

export interface IClientMethods {
  get: (url: string, config: IClientRequestConfig) => any;
  post: (url: string, body: any, config: IClientRequestConfig) => any;
  put: (url: string, body: any, config: IClientRequestConfig) => any;
  patch: (url: string, body: any, config: IClientRequestConfig) => any;
  delete: (url: string, config: IClientRequestConfig) => any;
}

export type TClient = () => IClientMethods;

export interface IConfigPromises {
  [baseURL: string]: Promise<object>;
}

export interface IEntityMetaPromises {
  [baseURL: string]: Promise<IEntityMeta>;
}

export interface ITSDataSource {
  // The URL of the website (e.g. "portal.tol.sanger.ac.uk")
  url?: string;
  // The path to the current API root (e.g. "api/v1")
  apiPath?: string;
  // The path, from the API root, to where data is served (e.g. "data")
  apiDataPath?: string;
  // Which data space to source from (e.g. "tol-production" or "treeofsex")
  dataspace?: string;
  // An optional data source instance id to uniquely identify this data source in the db
  dataSourceInstanceId?: string;
  // To allow for testing with mock clients
  client?: TClient;
}
