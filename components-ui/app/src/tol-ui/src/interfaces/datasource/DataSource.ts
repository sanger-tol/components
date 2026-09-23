/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type {
  IFilter,
  IJsonApiDataExtra,
  TApiMethod,
} from "..";

export interface IDataSource {
  custom(args: ICustom): Promise<any>;
  getOne(args: IGetOne): Promise<TDataObjectOrNull>;
  getToOneRelation(args: IGetToOneRelation): Promise<TDataObjectOrNull>;
  getByIds(args: IGetByIds): Promise<TDataObjectOrNull[]>;
  getListPage(args: IGetListPage): Promise<TDataObjectListOrNull>;
  getList(args: IGetList): Promise<TDataObjectListOrNull>;
  getListByCursor(args: IGetListCursor): AsyncGenerator<TDataObjectOrNull>;
  getCursorPage(args: IGetListCursor): Promise<TCursorObjectOrNull>;
  deleteByID(args: IGetOne): Promise<void>;
  upsert(args: IUpsert): Promise<TDataObjectListOrNull>;
}

export interface IGetOne {
  objectType: string;
  id: string;
  requestedFields?: string[];
}

export interface IGetToOneRelation {
  objectType: string;
  id: string;
  relation: string;
}

export interface IRelationshipPointer {
  id: string;
  type: string;
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
  requestedFields?: string[];
}

export interface IGetList {
  objectType: string;
  filter?: IFilter;
  requestedFields?: string[];
}

export interface IGetListCursor {
  objectType: string;
  page?: number;
  pageSize?: number;
  filter?: IFilter;
  requestedFields?: string[];
  searchAfter?: string[];
}

export interface ICustom {
  method: TApiMethod;
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
    [key: string]: TDataObjectOrNull | TDataObjectListOrNull;
  };
  fetchRelationships?: {
    [key: string]: Promise<TDataObjectOrNull | TDataObjectListOrNull>;
  };
}

export interface ISourceDataObject extends IDataObject, IJsonApiDataExtra {
  __sourceType: string;
  __sourceId: string;
}

export type TDataObjectOrNull = IDataObject | null;
export type TDataObjectListOrNull = TDataObjectOrNull[] | null;

export type TCursorSearchAfterOrNull = string[] | null;
export type TCursorObjectOrNull = [TDataObjectListOrNull, TCursorSearchAfterOrNull] | null