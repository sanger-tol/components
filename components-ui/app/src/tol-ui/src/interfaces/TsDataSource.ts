/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.
SPDX-License-Identifier: MIT
*/

import { IEntityMeta, IFilter, IJsonApiDataExtra } from "..";


export interface IConfigPromises {
  [baseUrl: string]: Promise<object>;
}

export interface IEntityMetaPromises {
  [baseUrl: string]: Promise<IEntityMeta>;
}

export interface IDataSource {
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
  client?: any;
}

export interface IGetOne {
  objectType: string;
  id: string;
  requestedFields?: string;
}

export interface IGetToOneRelation {
  objectType: string;
  id: string;
  relation: string;
}

export interface IUpsert {
  payload: IUpsertData[];
  objectType: string;
  params?: Record<string, any>;
}

interface IUpsertData {
  type: string;
  id?: any;
  attributes?: object;
  relationships?: object;
}

export interface IGetByIds {
  objectType: string;
  ids: string[];
}

export interface IGetListPage {
  objectType: string;
  page?: number;
  pageSize?: number;
  filter?: IFilter;
  sortBy?: string;
  requestedFields?: string;
}

export interface IGetList {
  objectType: string;
  filter?: IFilter;
  requestedFields?: string;
}

export interface IGetListCursor {
  objectType: string;
  page?: number;
  pageSize?: number;
  filter?: IFilter;
  requestedFields?: string;
  searchAfter?: string[];
}

export interface ICustom {
  method: string;
  resource: string;
  body?: any;
  params?: any;
  options?: any;
}

export interface IGetAttributeDescriptor {
  objectType: string;
  field: string;
}

export interface IDataObject {
  objectType: string;
  id: string;
  [attribute: string]: any;
  relationships?: {
    [key: string]: IDataObject;
  };
  fetchRelationships?: {
    [key: string]: Promise<IDataObject>;
  };
}

export interface ISourceDataObject extends IDataObject, IJsonApiDataExtra {
  __sourceType: string;
  __sourceId: string;
}

export interface IAttributeDescriptor {
  authoritative: boolean;
  available_on_relationships: boolean;
  cardinality?: number;
  description?: string;
  display_name?: string;
  python_type?: string;
  source?: string;
}

export type TDataObjectOrNull = IDataObject | null;
export type TDataObjectListOrNull = IDataObject[] | null;

export type TCursorSearchAfterOrNull = string[] | null;
export type TCursorObjectOrNull = [TDataObjectListOrNull, TCursorSearchAfterOrNull] | null
