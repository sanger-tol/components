/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { IFilter, EntityMeta, Attributes, Relationships } from "../../models";
import { httpClient } from "./httpClient";
import retry from "./Retry";
import { deepCopy } from "../../general/utils";

const EXCLUDED_DETAIL_CACHE_OBJECTS = [
  "component",
  "zone",
  "board",
  "view",
  "component_zone",
  "zone_view",
  "view_board",
  'prefect/flow_run',
];

interface DetailCache {
  [baseUrl: string]: {
    [objectType: string]: {
      [id: string]: number;
    };
  };
}
const detailCache: DetailCache = {};

interface DetailPromises {
  [baseUrl: string]: {
    [objectType: string]: Promise<object>;
  };
}
const detailPromises: DetailPromises = {};

// CONFIG //
interface ConfigPromises {
  [baseUrl: string]: Promise<object>;
}
const configPromises: ConfigPromises = {};

// ENTITY META //
interface EntityMetaPromises {
  [baseUrl: string]: Promise<EntityMeta>;
}
const entityMetaPromises: EntityMetaPromises = {};

interface DataSource {
  baseUrl?: string;
  client?: any;
}

interface GetOne {
  objectType: string;
  id: string;
}

interface GetToOneRelation {
  objectType: string;
  id: string;
  relation: string;
}

interface Upsert {
  payload: UpsertData[];
  objectType: string;
}

interface UpsertData {
  type: string;
  id?: any;
  attributes: object;
}

interface GetByIds {
  objectType: string;
  ids: string[];
}

interface GetListPage {
  objectType: string;
  page?: number;
  pageSize?: number;
  filter?: IFilter;
  sortBy?: string;
}

interface DataObject {
  objectType: string;
  id: string;
  [attribute: string]: any;
  relationships: {
    [key: string]: Promise<DataObject>;
  };
}

interface SourceDataObject extends DataObject {
  __sourceType: string;
  __sourceId: string;
}

type DataObjectOrNull = DataObject | null;
type DataObjectListOrNull = DataObject[] | null;

export default class TsDataSource {
  private client: any;
  private baseUrl: string | undefined;
  private baseUrlKey: string;

  constructor({ baseUrl, client }: DataSource = {}) {
    this.client = client ?? httpClient;
    this.baseUrl = baseUrl;
    this.baseUrlKey = this.baseUrl || "default";
  }

  private relationshipHandler = {
    get: async (target: SourceDataObject, key: string) => {
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
        const relationshipsTarget: SourceDataObject = {
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
    detailCache[this.baseUrlKey] = detailCache[this.baseUrlKey] ?? {};
    detailCache[this.baseUrlKey][objectType] =
      detailCache[this.baseUrlKey][objectType] ?? {};

    detailPromises[this.baseUrlKey] = detailPromises[this.baseUrlKey] ?? {};
    detailPromises[this.baseUrlKey][objectType] =
      detailPromises[this.baseUrlKey][objectType] ?? Promise.resolve();
  }

  private updateDetailCache(response: any, objectType: string) {
    if (objectType in EXCLUDED_DETAIL_CACHE_OBJECTS) return;
    detailCache[this.baseUrlKey] = detailCache[this.baseUrlKey] ?? {};
    detailCache[this.baseUrlKey][objectType] =
      detailCache[this.baseUrlKey][objectType] || {};
    return response.data.data.map((object: any) => {
      detailCache[this.baseUrlKey][objectType][object.id] =
        detailCache[this.baseUrlKey][objectType][object.id] || object;
      return new Proxy(
        detailCache[this.baseUrlKey][objectType][object.id],
        this.dataObjectHandler,
      );
    });
  }

  private getLocalStorageKey(o: string): string {
    return `${o}-${this.baseUrlKey}`;
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

  public async custom(
    endpoint: string,
    method: string,
    body?: any,
  ): Promise<any> {
    switch (method) {
      case "POST":
        return await this.client().post(endpoint, {
          baseUrl: this.baseUrl,
          data: body,
        });
      case "DELETE":
        return await this.client().delete(endpoint, {
          baseUrl: this.baseUrl,
        });
    }
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

  private addIds(attributes: Attributes) {
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

  private AddObjectTypeToAttributes = (
    attributes: Attributes,
  ) => {
    for (const [objectType, meta] of Object.entries(attributes)) {
      for (const [, value] of Object.entries(meta)) {
        value.object_type = objectType;
      }
    }
  }

  private flattenAttributes(
    attributes: Attributes,
    relationships: Relationships,
  ) {
    this.addIds(attributes);
    const newAttributes: Attributes = deepCopy(attributes);
    this.AddObjectTypeToAttributes(newAttributes);
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

  public async getEntityMeta(): Promise<EntityMeta> {
    if (!entityMetaPromises[this.baseUrlKey]) {
      entityMetaPromises[this.baseUrlKey] = (async () => {
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
                attributes as Attributes,
                relationships as Relationships,
              ),
              relationships,
            },
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

  public async getOne({ objectType, id }: GetOne): Promise<DataObjectOrNull> {
    this.initializeDetailCacheAndPromises(objectType);
    if (id in detailCache[this.baseUrlKey][objectType]) {
      // if object is in cache, return it
      return new Proxy(
        detailCache[this.baseUrlKey][objectType][id],
        this.dataObjectHandler,
      );
    }
    if (!(id in detailPromises[this.baseUrlKey][objectType])) {
      // if promise is not in progress, start a new one
      detailPromises[this.baseUrlKey][objectType][id] = this.client()
        .get(`/${objectType}/${id}`, { baseURL: this.baseUrl })
        .then((response: any) => {
          if (!EXCLUDED_DETAIL_CACHE_OBJECTS.includes(objectType)) {
            detailCache[this.baseUrlKey][objectType][id] = response.data.data;
          }
          return new Proxy(response.data.data, this.dataObjectHandler);
        })
        .catch((error: any) => {
          if (error.response.status === 404) return null;
          throw error;
        })
        .finally(() => {
          delete detailPromises[this.baseUrlKey][objectType][id]; // remove promise from in-progress list when it's done
        });
    }
    return detailPromises[this.baseUrlKey][objectType][id]; // return existing promise if it's in progress
  }

  public async getToOneRelation({
    objectType,
    id,
    relation,
  }: GetToOneRelation): Promise<DataObjectOrNull> {
    return await this.client()
      .get(`/${objectType}:to-one/${id}/${relation}`, { baseURL: this.baseUrl })
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
  }: GetByIds): Promise<DataObjectOrNull[]> {
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
  }: GetListPage): Promise<DataObjectListOrNull> {
    this.initializeDetailCacheAndPromises(objectType);
    return await this.client()
      .get(`/${objectType}`, {
        baseURL: this.baseUrl,
        params: {
          page: page,
          page_size: pageSize,
          filter: filter,
          sort_by: sortBy,
        },
      })
      .then((response: any) => {
        return this.updateDetailCache(response, objectType);
      })
      .catch((error: any) => {
        if (error.response.status === 404) return null;
        throw error;
      });
  }

  public async deleteByID({ objectType, id }: GetOne): Promise<void> {
    this.initializeDetailCacheAndPromises(objectType);
    return await this.client()
      .delete(`/${objectType}/${id}`, { baseURL: this.baseUrl })
      .then(() => {
        if (id in detailCache[this.baseUrlKey][objectType]) {
          delete detailCache[this.baseUrlKey][objectType][id];
        }
      })
      .catch((error: any) => {
        if (error.response.status === 404) return null;
        throw error;
      });
  }

  public async upsert({ payload, objectType }: Upsert): Promise<void> {
    this.initializeDetailCacheAndPromises(objectType);
    return await this.client()
      .post(
        `/${objectType}:upsert`,
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
}
