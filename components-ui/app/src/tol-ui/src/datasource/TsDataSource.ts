/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { retry } from "../services/http/retry";
import {
  IEntityMeta,
  IAttributes,
  IRelationships,
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
  EXCLUDED_DETAIL_CACHE_OBJECTS,
  httpClient,
  deepCopy,
  API_METHODS,
  IGetListCursor,
  TCursorObjectOrNull,
  normaliseCaps,
  IGetList,
  IGetFieldMetadata
} from "..";


const detailCache: IDetailCache = {};
const detailPromises: IDetailPromises = {};
const configPromises: IConfigPromises = {};
const entityMetaPromises: IEntityMetaPromises = {};

export class TsDataSource {
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

  public generateEndpoint(target?: string, suffix?: string): string {
    const prefix = this.apiPrefix ? `/${this.apiPrefix}` : "";
    const tg = target ? `/${target}` : "";
    const sf = suffix ? `${suffix}` : "";
    return `${prefix}${tg}${sf}`;
  }

  public getBaseUrl(): string | undefined {
    return this.baseUrl;
  }

  public getApiPrefix(): string | undefined {
    return this.apiPrefix;
  }

  private fetchRelationshipHandler = {
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

  private relationshipHandler = {
    get: (target: ISourceDataObject, key: string) => {
      const targetValue = target?.[key];

      if (targetValue === null) return null;

      if (targetValue !== undefined)
        return new Proxy(targetValue.data, this.dataObjectHandler);
    },
  };

  private dataObjectHandler = {
    get: (target: any, key: string) => {
      if (key === "objectType") return target.type;
      if (key === "id") return target.id;

      if (key === "fetchRelationships") {
        const relationshipsTarget: ISourceDataObject = {
          ...(target?.relationships ?? {}),
          __sourceType: target.type,
          __sourceId: target.id,
        };
        return new Proxy(relationshipsTarget, this.fetchRelationshipHandler);
      }

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
        this.dataObjectHandler
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
    return this.getConfig(this.generateEndpoint("_config/attribute_metadata"));
  }

  public async relationshipConfig(): Promise<object> {
    return this.getConfig(this.generateEndpoint("_config/relationships"));
  }

  private addIds(attributes: IAttributes) {
    for (const [objectType, attr] of Object.entries(attributes)) {
      attr["id"] = {
        authoritative: true,
        available_on_relationships: true,
        cardinality: 99999,
        description: null,
        display_name: normaliseCaps("id", objectType),
        python_type: "str",
        source: null,
      };
    }
  }

  private addObjectTypeToAttributes = (attributes: IAttributes) => {
    for (const [objectType, meta] of Object.entries(attributes)) {
      for (const [, value] of Object.entries(meta)) {
        value.object_type = objectType;
      }
    }
  };

  private flattenAttributes(
    attributes: IAttributes,
    relationships: IRelationships
  ) {
    this.addIds(attributes);
    const newAttributes: IAttributes = deepCopy(attributes);
    this.addObjectTypeToAttributes(newAttributes);
    for (const entity in relationships) {
      // just deal with one-side relationships
      const oneRelationships = relationships[entity]?.one;
      if (oneRelationships) {
        for (const [relationship, objType] of Object.entries(
          oneRelationships
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
            metaCopy.relationship_name = relationship;
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
                relationships as IRelationships
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

  private getOneCache(
    objectType: string,
    id: string
  ): TDataObjectOrNull | undefined {
    if (id in detailCache[this.sourceKey][objectType]) {
      return new Proxy(
        detailCache[this.sourceKey][objectType][id],
        this.dataObjectHandler
      );
    }
  }

  private getOneFetch(
    objectType: string,
    id: string
  ): Promise<TDataObjectOrNull> {
    if (!(id in detailPromises[this.sourceKey][objectType])) {
      detailPromises[this.sourceKey][objectType][id] = this.client()
        .get(this.generateEndpoint(objectType, `/${id}`), {
          baseURL: this.baseUrl,
        })
        .then((response: any) => {
          if (!EXCLUDED_DETAIL_CACHE_OBJECTS.includes(objectType)) {
            detailCache[this.sourceKey][objectType][id] = response.data.data;
          }
          return new Proxy(response.data.data, this.dataObjectHandler);
        })
        .catch((error: any) => {
          if (error?.response?.status === 404) return null;
          throw error;
        })
        .finally(() => {
          delete detailPromises[this.sourceKey][objectType][id];
        });
    }
    return detailPromises[this.sourceKey][objectType][id];
  }

  public async getOne({ objectType, id }: IGetOne): Promise<TDataObjectOrNull> {
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
      .get(this.generateEndpoint(objectType, `:to-one/${id}/${relation}`), {
        baseURL: this.baseUrl,
      })
      .then((response: any) => {
        return new Proxy(response.data.data, this.dataObjectHandler);
      })
      .catch((error: any) => {
        if (error?.response?.status === 404) return null;
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
    requestedFields,
  }: IGetListPage): Promise<TDataObjectListOrNull> {
    this.initializeDetailCacheAndPromises(objectType);
    return await this.client()
      .get(this.generateEndpoint(objectType), {
        baseURL: this.baseUrl,
        params: {
          page: page,
          page_size: pageSize,
          filter: filter,
          sort_by: sortBy,
          requested_fields: requestedFields,
        },
      })
      .then((response: any) => {
        return this.updateDetailCache(response, objectType);
      })
      .catch((error: any) => {
        if (error?.response?.status === 404) return null;
        throw error;
      });
  }

  public async getList({
    objectType,
    filter,
    requestedFields,
  }: IGetList): Promise<TDataObjectListOrNull> {
    const objectCursorLists = this.getListByCursor({
      objectType,
      filter,
      requestedFields,
    });
    const results: any[] = [];
    for await (const item of objectCursorLists) {
      results.push(item);
    }
    return results;
  }

  public async *getListByCursor({
    objectType,
    page,
    pageSize,
    filter,
    requestedFields,
    searchAfter,
  }: IGetListCursor): AsyncGenerator<TDataObjectOrNull> {
    let currentSearch = searchAfter;
    while (true) {
      const cursorObjects = await this.getCursorPage({
        objectType,
        page,
        pageSize,
        filter,
        requestedFields,
        searchAfter: currentSearch,
      });

      if (Array.isArray(cursorObjects)) {
        const [dataObjects, nextSearch] = cursorObjects;
        if (dataObjects) {
          for (const item of dataObjects) {
            yield item;
          }
          if (dataObjects.length === 0) {
            return;
          }
          currentSearch = nextSearch!;
        }
      } else {
        return null;
      }
    }
  }

  public async getCursorPage({
    objectType,
    page,
    pageSize = 100,
    filter,
    requestedFields,
    searchAfter,
  }: IGetListCursor): Promise<TCursorObjectOrNull> {
    return await this.client()
      .post(
        this.generateEndpoint(objectType, ":cursor"),
        { search_after: searchAfter },
        {
          baseURL: this.baseUrl,
          params: {
            page: page,
            page_size: pageSize,
            filter: filter,
            requested_fields: requestedFields,
          },
        }
      )
      .then((response: any) => {
        const dataObjects = response.data.data.map((object: any) => {
          return new Proxy(object, this.dataObjectHandler);
        });
        return [dataObjects, response.data.meta.search_after];
      })
      .catch((error: any) => {
        if (error?.response?.status === 404) return null;
        throw error;
      });
  }

  public async deleteByID({ objectType, id }: IGetOne): Promise<void> {
    this.initializeDetailCacheAndPromises(objectType);
    return await this.client()
      .delete(this.generateEndpoint(objectType, `/${id}`), {
        baseURL: this.baseUrl,
      })
      .then(() => {
        if (id in detailCache[this.sourceKey][objectType]) {
          delete detailCache[this.sourceKey][objectType][id];
        }
      })
      .catch((error: any) => {
        if (error?.response?.status === 404) return null;
        throw error;
      });
  }

  public async upsert({
    payload,
    objectType,
  }: IUpsert): Promise<TDataObjectListOrNull> {
    this.initializeDetailCacheAndPromises(objectType);
    return await this.client()
      .post(
        this.generateEndpoint(objectType, ":upsert"),
        { data: payload },
        { baseURL: this.baseUrl }
      )
      .then((response: any) => {
        return this.updateDetailCache(response, objectType);
      })
      .catch((error: any) => {
        if (error?.response?.status === 404) return null;
        throw error;
      });
  }

  public async custom({
    method,
    resource,
    body,
    params,
    options,
  }: ICustom): Promise<any> {
    const url = this.generateEndpoint(resource);
    switch (method.toUpperCase()) {
      case API_METHODS.GET:
        return await this.client().get(url, {
          baseURL: this.baseUrl,
          params: params,
          ...options,
        });
      case API_METHODS.POST:
        return await this.client().post(url, body, {
          baseURL: this.baseUrl,
          params: params,
          ...options,
        });
      case API_METHODS.PUT:
        return await this.client().put(url, body, {
          baseURL: this.baseUrl,
          params: params,
          ...options,
        });
      case API_METHODS.PATCH:
        return await this.client().patch(url, body, {
          baseURL: this.baseUrl,
          params: params,
        });
      case API_METHODS.DELETE:
        return await this.client().delete(url, {
          baseURL: this.baseUrl,
          params: params,
        });
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  }

  public async getFieldMetaData({
    objectType,
    field,
  }: IGetFieldMetadata): Promise<any> {
    const attributes = await this.attributeMetadata();
    const relationships = await this.relationshipConfig();
    return getFieldRelationshipValue(
      attributes,
      relationships,
      field,
      objectType
    );
  }
}

export function getFieldRelationshipValue(
  attributes: any,
  relationships: any,
  field: string,
  objectType: string
): any {
  const splitField = field.split(".");
  if (splitField.length > 1) {
    // Checks if the object type exists in the relationships of previous "jump"
    if (splitField[0] in relationships[objectType]?.one) {
      const relatedObjectType = relationships[objectType].one[splitField[0]];
      const remainingField = splitField.slice(1).join(".");
      return getFieldRelationshipValue(attributes, relationships, remainingField, relatedObjectType);
    }
  } else if (splitField.length === 1) {
    if (field in attributes[objectType]) {
      return attributes[objectType][field];
    }
  }
}

export function getFieldByName(object: TDataObjectOrNull, field: string): any {
  if (field.includes(".")) {
    const [relationship, ...rest] = field.split(".");
    const relationshipObject = object?.relationships?.[relationship];
    if (relationshipObject) {
      return getFieldByName(relationshipObject, rest.join("."));
    }
  }
  return object?.[field];
}
