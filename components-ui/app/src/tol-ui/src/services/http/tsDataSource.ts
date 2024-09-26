/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Attributes, Relationships } from 'src/models/EntityMeta';
import { Filter, EntityMeta } from '../../models';
import { httpClient } from './httpClient';


interface DetailCache {
  [objectType: string]: {
    [id: string]: number
  }
}
const detailCache: DetailCache = {};

interface DetailPromises {
  [objectType: string]: Promise<object>;
}
const detailPromises: DetailPromises = {};

// CONFIG //
interface ConfigPromises {
  [key: string]: Promise<object>;
}
const configPromises: ConfigPromises = {};

// ENTITY META //
interface EntityMetaPromises {
  [baseUrl: string]: Promise<EntityMeta>;
}
const entityMetaPromises: EntityMetaPromises = {};

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
type DataObjectListOrNull = DataObject[] | null;

export default class TsDataSource {
  private client: any;
  private baseUrl: string|undefined;
  private baseUrlKey: string;

  constructor({baseUrl, client}: DataSource) {
    this.client = client ?? httpClient;
    this.baseUrl = baseUrl;
    this.baseUrlKey = this.baseUrl || 'default';
  }

  private dataObjectHandler = {
    get: (target: any, key: string) => {
      if (key === 'objectType') return target.type;
      if (key === 'id') return target.id;
      return target.attributes[key];
    }
  }

  private initializeDetailCacheAndPromises(objectType: string) {
    detailCache[objectType] = detailCache[objectType] ?? {};
    detailPromises[objectType] = detailPromises[objectType] ?? Promise.resolve();
  }

  private getLocalStorageKey(o: string): string {
    return `${o}-${this.baseUrlKey}`;
  }

  private getSavedConfig(key: string): { data: object, expiry: Date } | null {
    const savedConfig = JSON.parse(localStorage.getItem(key) || 'null');
    if (savedConfig === null) return null;
    const expiry = new Date(savedConfig['expiry']);
    return { data: savedConfig.data, expiry };
  }

  private isConfigExpired(expiry: Date | null): boolean {
    const now = new Date();
    return !(expiry && now < expiry);
  }

  private fetchAndSaveConfig(endpoint: string, key: string): Promise<object> {
    const anHourFromNow = new Date();
    anHourFromNow.setHours(anHourFromNow.getHours() + 1);

    if (!configPromises[key]) {
      configPromises[key] = this.client().get(endpoint, {baseURL: this.baseUrl})
        .then(config => {
          const savedConfig = {
            expiry: anHourFromNow,
            data: config.data
          };
          localStorage.setItem(key, JSON.stringify(savedConfig));
          return savedConfig.data;
        })
        .finally(() => {
          delete configPromises[key];
        });
    }
    return configPromises[key];
  }

  public getConfig(endpoint: string): Promise<object> {
    const key = this.getLocalStorageKey(endpoint);
    const savedConfig = this.getSavedConfig(key);

    if (savedConfig && !this.isConfigExpired(savedConfig.expiry)) {
      return Promise.resolve(savedConfig.data);
    } else {
      return this.fetchAndSaveConfig(endpoint, key);
    }
  }

  public async attributeMetadata(): Promise<object> {
    return this.getConfig('/_config/attribute_metadata');
  }

  public async relationshipConfig(): Promise<object> {
    return this.getConfig('/_config/relationships');
  }

  private flattenAttributes(attributes: Attributes, relationships: Relationships) {
    for (const entity in relationships) {
      // just deal with one-side relationships
      const oneRelationships = relationships[entity]?.one;
      if (oneRelationships) {
        for (const [relationship, objType] of Object.entries(oneRelationships)) {
          attributes[entity][`${relationship}.id`] = {
            available_on_relationships: true,
            python_type: "str"
          };
          for (const [key, meta] of Object.entries(attributes[objType])) {
            if (meta.available_on_relationships) {
              attributes[entity][`${relationship}.${key}`] = meta;
            }
          }
        }
      }
    }
    return attributes;
  }

  public async getEntityMeta(): Promise<EntityMeta> {
    if (!entityMetaPromises[this.baseUrlKey]) {
      entityMetaPromises[this.baseUrlKey] = (async () => {
        const key = this.getLocalStorageKey('entityMeta');
        let savedEntityMeta = JSON.parse(localStorage.getItem(key) || 'null');
        const expiry = savedEntityMeta === null ? null : new Date(savedEntityMeta['expiry']);
  
        // setting now and an hour from now
        const now = new Date();
        const anHourFromNow = new Date(now);
        anHourFromNow.setHours(now.getHours() + 1);
  
        // check if entityMeta exists and is not expired
        if (expiry === null || now > expiry) {
          const attributes = await this.getConfig('/_config/attribute_metadata');
          const relationships = await this.getConfig('/_config/relationships');
          savedEntityMeta = {
            expiry: anHourFromNow,
            data: {
              flatAttributes: this.flattenAttributes(
                attributes as Attributes,
                relationships as Relationships
              ),
              relationships
            }
          };
          localStorage.setItem(key, JSON.stringify(savedEntityMeta));
        }
        return savedEntityMeta.data as EntityMeta;
      })().finally(() => {
        delete entityMetaPromises[this.baseUrlKey];
      });
    }
    return entityMetaPromises[this.baseUrlKey];
  }

  public async getById({
    objectType,
    id
  }: GetById): Promise<DataObjectOrNull> {
    this.initializeDetailCacheAndPromises(objectType);
    if (id in detailCache[objectType]) { // if object is in cache, return it
      return new Proxy(detailCache[objectType][id], this.dataObjectHandler);
    }
    if (!(id in detailCache[objectType])) {
      detailPromises[objectType][id] = this.client().get(
        `/${objectType}/${id}`,
        {baseURL: this.baseUrl}
      )
      .then((response: any) => {
        detailCache[objectType][id] = response.data.data;
        return new Proxy(response.data.data, this.dataObjectHandler);
      })
      .catch((error: any) => {
        if (error.response.status === 404) return null;
        throw error;
      });
    }
    return detailPromises[objectType][id];
  }

  public async getByIds({
    objectType,
    ids
  }: GetByIds): Promise<DataObjectOrNull[]> {
    this.initializeDetailCacheAndPromises(objectType);
    const promiseBulk = ids.map(id => this.getById({ objectType, id }));
    return await Promise.all(promiseBulk);
  }

  public async getListPage({
    objectType,
    page,
    pageSize,
    filter,
    sortBy
  }: GetList): Promise<DataObjectListOrNull[]> {
    return await this.client().get(
      `/${objectType}`,
      {
        baseURL: this.baseUrl,
        params: {
          page: page,
          page_size: pageSize,
          filter: filter,
          sort_by: sortBy
        }
      }
    )
    .then((response: any) => {
      detailCache[objectType] = detailCache[objectType] || {};
      return response.data.data.map((object: any) => {
        detailCache[objectType][object.id] = object;
        return new Proxy(object, this.dataObjectHandler);
      });
    })
    .catch((error: any) => {
      if (error.response.status === 404) return null;
      throw error;
    });
  }
}
