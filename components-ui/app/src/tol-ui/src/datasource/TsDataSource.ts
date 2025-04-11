/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { IEntityMeta, IAttributes, IRelationships } from "../models";
import {
  IDetailCache,
  IDetailPromises,
  IConfigPromises,
  IEntityMetaPromises,
  IDataSource,
  IGetOne,
  IGetToOneRelation,
  IUpsert,
  IGetByIds,
  IGetListPage,
  ICustom,
  ISourceDataObject,
  TDataObjectOrNull,
  TDataObjectListOrNull,
} from "../models/DataSource";
import { EXCLUDED_DETAIL_CACHE_OBJECTS } from "../constants/datasource.constants";
import { httpClient } from "../services/http/httpClient";
import { retry } from "../services/http/retry";
import { deepCopy } from "../general/utils";


const detailCache: IDetailCache = {};
const detailPromises: IDetailPromises = {};
const configPromises: IConfigPromises = {};
const entityMetaPromises: IEntityMetaPromises = {};

export default class TsDataSource {
  private client: any;
  private baseUrl: string | undefined;
  private apiPrefix: string | undefined;
  private sourceKey: string;

  constructor({ baseUrl, apiPrefix, client }: IDataSource = {}) {
    this.client = client ?? httpClient;
    this.baseUrl = baseUrl;
    this.apiPrefix = apiPrefix;
    this.sourceKey = `${baseUrl || "default"}/${apiPrefix || "default"}`;
  }

  private generateEndpoint(target: string, objectId?: string): string {
    const prefix = this.apiPrefix ? `/${this.apiPrefix}` : "";
    const tar = this.apiPrefix ? target : `/${target}`;
    const id = objectId ? `/${objectId}` : "";
    return `${prefix}${tar}${id}`;
  }

  private relationshipHandler = {
    get: async (target: ISourceDataObject, key: string) => {
      const targetValue = target?.[key];

      if (targetValue === null) return null;

      if (targetValue !== undefined)
        return new Proxy(targetValue.data, this.dataObjectHandler);

      return await this.getToOneRelation({
        objectType: target.__sourceType,
        id: target.__sourceId,
        relation: key,
      });
    },
  };

  private dataObjectHandler = {
    get: (target: any, key: string) => {
      if (key === "objectType") return target.type;
      if (key === "id") return target.id;

      if (key === "relationships") {
        const relationshipsTarget: ISourceDataObject = {
          ...(target?.relationships ?? {}),
          __sourceType: target.type,
          __sourceId: target.id,
        };
        return new Proxy(relationshipsTarget, this.relationshipHandler);
      }

      return target.attributes?.[key];
    },
  };

  private initializeDetailCacheAndPromises(objectType: string) {
    detailCache[this.sourceKey] = detailCache[this.sourceKey] ?? {};
    detailCache[this.sourceKey][objectType] =
      detailCache[this.sourceKey][objectType] ?? {};

    detailPromises[this.sourceKey] = detailPromises[this.sourceKey] ?? {};
    detailPromises[this.sourceKey][objectType] =
      detailPromises[this.sourceKey][objectType] ?? Promise.resolve();
  }

  private updateDetailCache(response: any, objectType: string) {
    if (objectType in EXCLUDED_DETAIL_CACHE_OBJECTS) return;
    detailCache[this.sourceKey] = detailCache[this.sourceKey] ?? {};
    detailCache[this.sourceKey][objectType] =
      detailCache[this.sourceKey][objectType] || {};
    return response.data.data.map((object: any) => {
      detailCache[this.sourceKey][objectType][object.id] =
        detailCache[this.sourceKey][objectType][object.id] || object;
      return new Proxy(
        detailCache[this.sourceKey][objectType][object.id],
        this.dataObjectHandler,
      );
    });
  }

  private getLocalStorageKey(o: string): string {
    return `${o}-${this.sourceKey}`;
  }

  private getSavedConfig(key: string): { data: object; expiry: Date } | null {
    const savedConfig = JSON.parse(localStorage.getItem(key) || "null");
    if (savedConfig === null) return null;
    const expiry = new Date(savedConfig["expiry"]);
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
      configPromises[key] = this.client()
        .get(endpoint, { baseURL: this.baseUrl })
        .then((config) => {
          const savedConfig = {
            expiry: anHourFromNow,
            data: config.data,
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

  @retry(3)
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
    return this.getConfig("/_config/attribute_metadata");
  }

  public async relationshipConfig(): Promise<object> {
    return this.getConfig("/_config/relationships");
  }

  private addIds(attributes: IAttributes) {
    for (const objectType of Object.values(attributes)) {
      if (!objectType.hasOwnProperty("uid")) {
        objectType["id"] = {
          authoritative: null,
          available_on_relationships: null,
          cardinality: 99999,
          description: null,
          display_name: null,
          python_type: "str",
          source: null,
        };
      }
    }
  }

  private addObjectTypeToAttributes = (
    attributes: IAttributes,
  ) => {
    for (const [objectType, meta] of Object.entries(attributes)) {
      for (const [, value] of Object.entries(meta)) {
        value.object_type = objectType;
      }
    }
  }

  private flattenAttributes(
    attributes: IAttributes,
    relationships: IRelationships,
  ) {
    this.addIds(attributes);
    const newAttributes: IAttributes = deepCopy(attributes);
    this.addObjectTypeToAttributes(newAttributes);
    for (const entity in relationships) {
      // just deal with one-side relationships
      const oneRelationships = relationships[entity]?.one;
      if (oneRelationships) {
        for (const [relationship, objType] of Object.entries(
          oneRelationships,
        )) {
          newAttributes[entity][`${relationship}.id`] = {
            available_on_relationships: true,
            python_type: "str",
            object_type: objType,
            relationship_name: relationship,
          };
          for (const [key, meta] of Object.entries(attributes[objType])) {
            const metaCopy = deepCopy(meta);
            metaCopy.object_type = objType;
            metaCopy.relationship_name = relationship
            if (meta.available_on_relationships) {
              newAttributes[entity][`${relationship}.${key}`] = metaCopy;
            }
          }
        }
      }
    }
    return newAttributes;
  }

  public async getEntityMeta(): Promise<IEntityMeta> {
    if (!entityMetaPromises[this.sourceKey]) {
      entityMetaPromises[this.sourceKey] = (async () => {
        const key = this.getLocalStorageKey("entityMeta");
        let savedEntityMeta = JSON.parse(localStorage.getItem(key) || "null");
        const expiry =
          savedEntityMeta === null ? null : new Date(savedEntityMeta["expiry"]);

        // setting now and an hour from now
        const now = new Date();
        const anHourFromNow = new Date(now);
        anHourFromNow.setHours(now.getHours() + 1);
        // check if entityMeta exists and is not expired
        if (expiry === null || now > expiry) {
          const attributes = await this.attributeMetadata();
          const relationships = await this.relationshipConfig();
          savedEntityMeta = {
            expiry: anHourFromNow,
            data: {
              flatAttributes: this.flattenAttributes(
                attributes as IAttributes,
                relationships as IRelationships,
              ),
              relationships,
            },
          };
          localStorage.setItem(key, JSON.stringify(savedEntityMeta));
        }
        return savedEntityMeta.data as IEntityMeta;
      })().finally(() => {
        delete entityMetaPromises[this.sourceKey];
      });
    }
    return entityMetaPromises[this.sourceKey];
  }

  private getOneCache(objectType: string, id: string): TDataObjectOrNull | undefined {
    if (id in detailCache[this.sourceKey][objectType]) {
      return new Proxy(detailCache[this.sourceKey][objectType][id], this.dataObjectHandler);
    }
  }

  private getOneFetch(
    objectType: string,
    id: string
  ): Promise<TDataObjectOrNull> {
    if (!(id in detailPromises[this.sourceKey][objectType])) {
      detailPromises[this.sourceKey][objectType][id] = this.client()
        .get(
          this.generateEndpoint(objectType, id),
          { baseURL: this.baseUrl }
        )
        .then((response: any) => {
          if (!EXCLUDED_DETAIL_CACHE_OBJECTS.includes(objectType)) {
            detailCache[this.sourceKey][objectType][id] = response.data.data;
          }
          return new Proxy(response.data.data, this.dataObjectHandler);
        })
        .catch((error: any) => {
          if (error.response.status === 404) return null;
          throw error;
        })
        .finally(() => {
          delete detailPromises[this.sourceKey][objectType][id];
        });
    }
    return detailPromises[this.sourceKey][objectType][id];
  }

  public async getOne({
    objectType,
    id
  }: IGetOne): Promise<TDataObjectOrNull> {
    this.initializeDetailCacheAndPromises(objectType);
    const cached = this.getOneCache(objectType, id);
    if (cached) return cached;
    return this.getOneFetch(objectType, id);
  }

  public async getToOneRelation({
    objectType,
    id,
    relation,
  }: IGetToOneRelation): Promise<TDataObjectOrNull> {
    return await this.client()
      .get(
        `${this.generateEndpoint(objectType)}:to-one/${id}/${relation}`,
        { baseURL: this.baseUrl }
      )
      .then((response: any) => {
        return new Proxy(response.data.data, this.dataObjectHandler);
      })
      .catch((error: any) => {
        if (error.response.status === 404) return null;
        throw error;
      });
  }

  public async getByIds({
    objectType,
    ids,
  }: IGetByIds): Promise<TDataObjectOrNull[]> {
    this.initializeDetailCacheAndPromises(objectType);
    const promiseBulk = ids.map((id) => this.getOne({ objectType, id }));
    return await Promise.all(promiseBulk);
  }

  public async getListPage({
    objectType,
    page,
    pageSize,
    filter,
    sortBy,
  }: IGetListPage): Promise<TDataObjectListOrNull> {
    this.initializeDetailCacheAndPromises(objectType);
    return await this.client()
      .get(
        this.generateEndpoint(objectType),
        {
          baseURL: this.baseUrl,
          params: {
            page: page,
            page_size: pageSize,
            filter: filter,
            sort_by: sortBy,
          },
        }
      )
      .then((response: any) => {
        return this.updateDetailCache(response, objectType);
      })
      .catch((error: any) => {
        if (error.response.status === 404) return null;
        throw error;
      });
  }

  public async deleteByID({
    objectType,
    id
  }: IGetOne): Promise<void> {
    this.initializeDetailCacheAndPromises(objectType);
    return await this.client()
      .delete(
        this.generateEndpoint(objectType, id),
        { baseURL: this.baseUrl },
      )
      .then(() => {
        if (id in detailCache[this.sourceKey][objectType]) {
          delete detailCache[this.sourceKey][objectType][id];
        }
      })
      .catch((error: any) => {
        if (error.response.status === 404) return null;
        throw error;
      });
  }

  public async upsert({
    payload,
    objectType
  }: IUpsert): Promise<void> {
    this.initializeDetailCacheAndPromises(objectType);
    return await this.client()
      .post(
        `${this.generateEndpoint(objectType)}:upsert`,
        { data: payload },
        { baseURL: this.baseUrl },
      )
      .then((response: any) => {
        return this.updateDetailCache(response, objectType);
      })
      .catch((error: any) => {
        if (error.response.status === 404) return null;
        throw error;
      });
  }

  public async custom({
    method,
    resource,
    params,
    body,
  }: ICustom): Promise<any> {
    const url = this.generateEndpoint(resource);
    switch (method.toUpperCase()) {
      case ApiMethods.GET:
        return await this.client().get(url, {
          baseURL: this.baseUrl,
          params: params,
        });
      case ApiMethods.POST:
        return await this.client().post(url, body, {
          baseUrl: this.baseUrl,
          params: params,
        });
      case ApiMethods.PUT:
        return await this.client().put(url, body, {
          baseUrl: this.baseUrl,
          params: params,
        });
      case ApiMethods.PATCH:
        return await this.client().patch(url, body, {
          baseUrl: this.baseUrl,
        });
      case ApiMethods.DELETE:
        return await this.client().delete(url, {
          baseURL: this.baseUrl,
        });
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  }
}
