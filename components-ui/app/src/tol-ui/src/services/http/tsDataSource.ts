/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Filter, EntityConfig } from '../../models';
import { httpClient } from './httpClient';

const entityConfigPromises: {
  [baseUrl: string]: Promise<EntityConfig>
} = {};

const promises: {
  [objectType: string]: Promise<object>
} = {};

const cache: {
  [objectType: string]: {
    [id: string]: number
  }
} = {};

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
  attributes?: object,
  relationships?: object
}

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
      if (key === 'objectType') return target.type;
      if (key === 'id') return target.id;
      return target.attributes[key];
    }
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
  }: GetById) : Promise<DataObject> {
    promises[objectType] = promises[objectType] || Promise.resolve({});
    promises[objectType] = promises[objectType].then(async () => {
      if (!(objectType in cache)) cache[objectType] = {};
      if (id in cache[objectType]) return cache[objectType][id];
      const retrievedData = await this.client().get(
        `/${objectType}/${id}`,
        {baseURL: this.baseUrl}
      )
      cache[objectType][id] = retrievedData;
      return retrievedData;
    });
    return new Proxy(
      await promises[objectType],
      this.dataObjectHandler
    ) as Promise<DataObject>;
  }

  public async getByIds({
    objectType,
    ids
  }: GetByIds) : Promise<DataObject[]> {
    const dataObjects: DataObject[] = [];
    for (const id of ids) {
      const dataObject = await this.getById({ objectType, id });
      dataObjects.push(dataObject);
    }
    return dataObjects;
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
