/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.
SPDX-License-Identifier: MIT
*/

import { IEntityMeta, IFilter } from "..";

export interface IDetailCache {
  [baseUrl: string]: {
    [objectType: string]: {
      [id: string]: number;
    };
  };
}

export interface IDetailPromises {
  [baseUrl: string]: {
    [objectType: string]: Promise<object>;
  };
}

export interface IConfigPromises {
  [baseUrl: string]: Promise<object>;
}

export interface IEntityMetaPromises {
  [baseUrl: string]: Promise<IEntityMeta>;
}

export interface IDataSource {
  baseUrl?: string;
  apiPrefix?: string;
  client?: any;
}

export interface IGetOne {
  objectType: string;
  id: string;
}

export interface IGetToOneRelation {
  objectType: string;
  id: string;
  relation: string;
}

export interface IUpsert {
  payload: IUpsertData[];
  objectType: string;
}

interface IUpsertData {
  type: string;
  id?: any;
  attributes: object;
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

interface IDataObject {
  objectType: string;
  id: string;
  [attribute: string]: any;
  relationships: {
    [key: string]: Promise<IDataObject>;
  };
}

export interface ISourceDataObject extends IDataObject {
  __sourceType: string;
  __sourceId: string;
}

export type TDataObjectOrNull = IDataObject | null;
export type TDataObjectListOrNull = IDataObject[] | null;
