/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Filter, EntityConfig } from '../../models';
import { httpClient } from './httpClient';


interface Cache {
  [objectType: string]: {
    [id: string]: number
  }
}

interface Promises {
  [objectType: string]: Promise<object>;
}

interface EntityConfigPromises {
  [baseUrl: string]: Promise<EntityConfig>;
}

const promises: Promises = {};

const cache: Cache = {};

const entityConfigPromises: EntityConfigPromises = {};

interface DataSource {
  baseUrl?: string,
  client?: any
}

interface GetById {
  objectType: string,
  id: string
}

interface GetByIds {
  objectType: string,
  ids: string[]
}

interface GetList {
  objectType: string,
  page?: number,
  pageSize?: number,
  filter?: Filter,
  sortBy?: string
}

interface DataObject {
  objectType: string,
  id: string,
  [attribute: string]: any
}

type DataObjectOrNull = DataObject | null;

export class TsDataSource {
  private client: any;
  private baseUrl: string|undefined;
  private entityMeta: Promise<EntityConfig>;

  constructor({baseUrl, client}: DataSource) {
    this.client = client ?? httpClient;
    this.baseUrl = baseUrl;
    this.entityMeta = this.getEntityConfig();
  }

  private dataObjectHandler = {
    get: (target: any, key: string) => {
      if (!target) return null;
      if (key === 'objectType') return target.type;
      if (key === 'id') return target.id;
      return target.attributes[key];
    }
  }

  private initializeCacheAndPromises(objectType: string) {
    cache[objectType] = cache[objectType] ?? {};
    promises[objectType] = promises[objectType] ?? Promise.resolve();
  }

  private async getEntityConfig(): Promise<EntityConfig> {
    const baseUrlKey = this.baseUrl || 'default';
  
    if (!entityConfigPromises[baseUrlKey]) {
      entityConfigPromises[baseUrlKey] = (async () => {
        const key = 'typesMeta-' + baseUrlKey;
        let savedTypesMeta = JSON.parse(localStorage.getItem(key) || 'null');
        const expiry = savedTypesMeta === null ? null : new Date(savedTypesMeta['expiry']);
  
        // setting now and an hour from now
        const now = new Date();
        const anHourFromNow = new Date(now);
        anHourFromNow.setHours(now.getHours() + 1);
  
        // check if typesMeta exists and is not expired
        if (expiry === null || now > expiry) {
          const attributes = await this.client().get(
            '/_config/attribute_metadata',
            {baseURL: this.baseUrl}
          );
          const relationships = await this.client().get(
            '/_config/relationships',
            {baseURL: this.baseUrl}
          );
          savedTypesMeta = {
            expiry: anHourFromNow,
            data: {
              attributes,
              relationships
            }
          };
          localStorage.setItem(key, JSON.stringify(savedTypesMeta));
        }

        return savedTypesMeta.data as EntityConfig;
      })().finally(() => {
        delete entityConfigPromises[baseUrlKey];
      });
    }
    return entityConfigPromises[baseUrlKey];
  }

  public async getById({
    objectType,
    id
  }: GetById) : Promise<DataObjectOrNull> {
    this.initializeCacheAndPromises(objectType);
    const data = await promises[objectType]
      .then(async () => {
        if (id in cache[objectType]) return cache[objectType][id];
        const retrievedData = await this.client().get(
          `/${objectType}/${id}`,
          {baseURL: this.baseUrl}
        )
        cache[objectType][id] = retrievedData.data.data;
        return retrievedData.data.data;
      })
      .catch((error) => {
        if (error.response.status === 404) return null;
        throw error;
      });
    return new Proxy(data, this.dataObjectHandler);
  }

  public async getByIds({
    objectType,
    ids
  }: GetByIds) : Promise<DataObjectOrNull[]> {
    this.initializeCacheAndPromises(objectType);
    const promiseBulk = ids.map(id => this.getById({ objectType, id }));
    return await Promise.all(promiseBulk);
  }

  public async getList({
    objectType,
    page,
    pageSize,
    filter,
    sortBy
  }: GetList) : Promise<DataObject[]> {
    return await this.client().get(
      `/${objectType}`,
      {
        baseURL: this.baseUrl,
        page: page,
        page_size: pageSize,
        filter: filter,
        sort_by: sortBy
      }
    )
  }
}
