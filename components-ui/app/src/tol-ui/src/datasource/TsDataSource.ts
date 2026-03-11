/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { retry } from "../services/http/retry";
import { clearExpiredToken } from "../services/auth/clearExpiredToken";
import {
  IEntityMeta,
  IAttributes,
  IRelationships,
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
  httpClient,
  deepCopy,
  API_METHODS,
  IGetListCursor,
  TCursorObjectOrNull,
  normaliseCaps,
  IGetList,
  IGetAttributeDescriptor,
  IAttributeDescriptor,
  API_OPERATIONS,
  IIncludedLookup,
  IJsonApiData,
  IJsonApiResponse,
  IJsonApiResponseData,
  IRelationshipPointer,
} from "..";


const configPromises: IConfigPromises = {};
const entityMetaPromises: IEntityMetaPromises = {};

export class TsDataSource {
  private client: any;
  private url: string | undefined;
  private apiPath: string | undefined;
  private apiDataPath: string | undefined;
  private dataspace: string | undefined;
  private dataSourceInstanceId: string | undefined;
  private baseURL: string | undefined;
  private sourceKey: string;

  constructor({ url, apiPath, apiDataPath, dataspace, dataSourceInstanceId, client }: IDataSource = {}) {
    this.client = client ?? httpClient;
    this.url = url;
    this.apiPath = apiPath;
    this.apiDataPath = apiDataPath;
    this.dataspace = dataspace;
    this.dataSourceInstanceId = dataSourceInstanceId;
    this.baseURL = this.initialiseBaseUrl();
    this.sourceKey = this.baseURL ?? "default";
  }

  private initialiseBaseUrl(): string | undefined {
    // if all parts passed in are undefined, then this should be undefined overall
    if (!this.url && !this.apiPath && !this.apiDataPath && !this.dataspace) {
      return undefined;
    }

    // else join all parts together to form the baseURL
    let baseURL = "";
    baseURL += this.url ? `${this.url}` : "";
    baseURL += this.apiPath ? `${this.apiPath}` : "";
    baseURL += this.apiDataPath ? `${this.apiDataPath}` : "";
    baseURL += this.dataspace ? `/${this.dataspace}` : "";
    return baseURL;
  }

  public getDataSourceInstanceId(): string | undefined {
    return this.dataSourceInstanceId;
  }

  public getBaseUrl(): string | undefined {
    return this.baseURL;
  }

  public generateEndpoint(target?: string, suffix?: string): string {
    const tg = target ? `${target}` : "";
    const sf = suffix ? `${suffix}` : "";
    return `${tg}${sf}`;
  }

  private normaliseParams = (params?: Record<string, any>) => (
    Object.fromEntries(
      Object.entries(params ?? {})
        .filter(([_, v]) => {
          if (v === undefined || v === null) return false;
          if (typeof v === "string" && v.trim() === "") return false;
          if (Array.isArray(v) && v.length === 0) return false; // drop empty arrays
          return true;
        })
        .map(([k, v]) => {
          if (k === "requested_fields" && Array.isArray(v)) {
            return [k, v.join(",")];
          }
          return [k, v];
        })
    )
  );

  private createRelationshipHandler(
    fetcher?: (args: IGetToOneRelation) => Promise<TDataObjectOrNull>
  ) {
    return {
      get: (relationships: ISourceDataObject, relationKey: string) => {
        const relation = relationships?.[relationKey];

        const createIncludedProxy = (data: IRelationshipPointer) => {
          const includedData =
            relationships.__includedLookup?.[data.type]?.[data.id];
          return new Proxy(
            {
              ...includedData,
              id: data.id,
              type: data.type,
              __includedLookup: relationships.__includedLookup,
              __meta: relationships.__meta,
            },
            this.dataObjectHandler
          );
        };

        if (relation === null) return null;

        if (relation?.data?.id && relation?.data?.type) {
          return createIncludedProxy(relation.data);
        }

        if (Array.isArray(relation?.data)) {
          return relation.data.map((item: IRelationshipPointer) =>
            createIncludedProxy(item)
          );
        }

        if (!fetcher) return undefined;

        return fetcher({
          objectType: relationships.__sourceType,
          id: relationships.__sourceId,
          relation: relationKey,
        });
      },
    };
  }

  private relationshipHandler = this.createRelationshipHandler();

  private fetchRelationshipHandler = this.createRelationshipHandler(
    (args) => this.getToOneRelation(args)
  );

  private createRelationshipsProxy = (target: any, handler: any) => {
    const relationshipsTarget: ISourceDataObject = {
      ...(target?.relationships ?? {}),
      __sourceType: target.type,
      __sourceId: target.id,
      __includedLookup: target.__includedLookup,
      __meta: target.__meta,
    };
    return new Proxy(relationshipsTarget, handler);
  };

  private buildIncludedLookup(included: any[] | undefined): IIncludedLookup {
    const lookup: IIncludedLookup = {};
    if (!included) return lookup;

    for (const item of included) {
      const type = item?.type;
      const id = item?.id;
      if (!type || !id) continue;

      const typeLookup = (lookup[type] ??= {});
      typeLookup[id] = item;
    }

    return lookup;
  }

  private dataObjectHandler = {
    get: (data: IJsonApiData, key: string) => {
      if (key === "objectType") return data.type;
      if (key === "id") return data.id;

      if (key === "fetchRelationships") {
        return this.createRelationshipsProxy(data, this.fetchRelationshipHandler);
      }

      if (key === "relationships") {
        return this.createRelationshipsProxy(data, this.relationshipHandler);
      }

      return data?.attributes?.[key];
    },
  };

  private jsonApiResponseToDataObject = (response: IJsonApiResponse) => {
    const responseData: IJsonApiResponseData = response.data;
    const isSingleObject = !Array.isArray(responseData.data);

    const data: IJsonApiData[] = isSingleObject
      ? [responseData.data as IJsonApiData]
      : responseData.data as IJsonApiData[];
    const included: IIncludedLookup = this.buildIncludedLookup(responseData.included);
    const meta = responseData.meta;

    const dataObjects = data?.map((datum: IJsonApiData) => (
      new Proxy(
        {
          ...datum,
          __includedLookup: included,
          __meta: meta,
        },
        this.dataObjectHandler
      )
    ));
    return isSingleObject ? dataObjects[0] : dataObjects;
  }

  private getLocalStorageKey(o: string): string {
    return `${o}-${this.sourceKey}`;
  }

  @clearExpiredToken()
  public async custom({
    method,
    resource,
    body,
    params,
    options,
  }: ICustom): Promise<any> {
    const client = this.client();
    const url = `/${resource}`;
    const config = {
      baseURL: this.baseURL,
      params: this.normaliseParams(params),
      ...options,
    }

    switch (method.toUpperCase()) {
      case API_METHODS.GET:
        return await client.get(url, config);
      case API_METHODS.POST:
        return await client.post(url, body, config);
      case API_METHODS.PUT:
        return await client.put(url, body, config);
      case API_METHODS.PATCH:
        return await client.patch(url, body, config);
      case API_METHODS.DELETE:
        return await client.delete(url, config);
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
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

  private fetchAndSaveConfig(resource: string, key: string): Promise<object> {
    const anHourFromNow = new Date();
    anHourFromNow.setHours(anHourFromNow.getHours() + 1);
    if (!configPromises[key]) {
      configPromises[key] = this.custom({
        method: API_METHODS.GET,
        resource,
      })
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
  public getConfig(resource: string): Promise<object> {
    const key = this.getLocalStorageKey(resource);
    const savedConfig = this.getSavedConfig(key);

    if (savedConfig && !this.isConfigExpired(savedConfig.expiry)) {
      return Promise.resolve(savedConfig.data);
    } else {
      return this.fetchAndSaveConfig(resource, key);
    }
  }

  public async attributeMetadata(): Promise<object> {
    return this.getConfig("_config/attribute_metadata");
  }

  public async relationshipConfig(): Promise<object> {
    return this.getConfig("_config/relationships");
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

  public async getOne({
    objectType,
    id,
    requestedFields,
  }: IGetOne): Promise<TDataObjectOrNull> {
    return this.custom({
      method: API_METHODS.GET,
      resource: this.generateEndpoint(objectType, `/${id}`),
      params: {
        requested_fields: requestedFields,
      },
    })
      .then((response: IJsonApiResponse) => {
        return this.jsonApiResponseToDataObject(response) as unknown as TDataObjectOrNull;
      })
      .catch((error: any) => {
        if (error?.response?.status === 404) return null;
        throw error;
      });
  }

  public async getToOneRelation({
    objectType,
    id,
    relation,
  }: IGetToOneRelation): Promise<TDataObjectOrNull> {
    return this.custom({
      method: API_METHODS.GET,
      resource: this.generateEndpoint(objectType, `${API_OPERATIONS.TO_ONE}/${id}/${relation}`),
    })
      .then((response: IJsonApiResponse) => {
        return this.jsonApiResponseToDataObject(response) as unknown as TDataObjectOrNull;
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
    return this.custom({
      method: API_METHODS.POST,
      resource: this.generateEndpoint(objectType),
      body: {
        filter: filter,
        sort_by: sortBy,
        requested_fields: requestedFields?.join(","),
      },
      params: {
        page: page,
        page_size: pageSize,
      },
    })
      .then((response: IJsonApiResponse) => {
        return this.jsonApiResponseToDataObject(response) as unknown as TDataObjectListOrNull;
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
    return this.custom({
      method: API_METHODS.POST,
      resource: this.generateEndpoint(objectType, API_OPERATIONS.CURSOR),
      body: { search_after: searchAfter },
      params: {
        page: page,
        page_size: pageSize,
        filter: filter,
        requested_fields: requestedFields,
      },
    })
      .then((response: IJsonApiResponse) => {
        return [
          this.jsonApiResponseToDataObject(response),
          response.data.meta.search_after,
        ] as unknown as TCursorObjectOrNull;
      })
      .catch((error: any) => {
        if (error?.response?.status === 404) return null;
        throw error;
      });
  }

  public async deleteByID({ objectType, id }: IGetOne): Promise<void> {
    return this.custom({
      method: API_METHODS.DELETE,
      resource: this.generateEndpoint(objectType, `/${id}`),
    })
      .catch((error: any) => {
        if (error?.response?.status === 404) return null;
        throw error;
      });
  }

  public async upsert({
    payload,
    objectType,
    params
  }: IUpsert): Promise<TDataObjectListOrNull> {
    return this.custom({
      method: API_METHODS.POST,
      resource: this.generateEndpoint(objectType, API_OPERATIONS.UPSERT),
      body: { data: payload },
      params,
    })
      .then((response: IJsonApiResponse) => {
        return this.jsonApiResponseToDataObject(response) as unknown as TDataObjectListOrNull;
      })
      .catch((error: any) => {
        if (error?.response?.status === 404) return null;
        throw error;
      });
  }

  private async getAttributeDescriptorValue(
    field: string,
    objectType: string
  ): Promise<IAttributeDescriptor | undefined> {
    const attributes = await this.attributeMetadata();
    const splitField = field.split(".");
    const combinedRelationships = await this.combineRelationships(objectType);
    if (splitField.length > 1 && combinedRelationships) {
      // Checks if the object type exists in the relationships of previous "jump"
      // If relationship exists, get the related object type and continue down the field path
      if (splitField[0] in combinedRelationships) {
        const relatedObjectType = combinedRelationships[splitField[0]];
        const remainingField = splitField.slice(1).join(".");
        return this.getAttributeDescriptorValue(remainingField, relatedObjectType);
      }
    } else if (splitField.length === 1) {
      if (field in attributes[objectType]) {
        return attributes[objectType][field];
      }
    }
  }

  public async getAttributeDescriptor({
    objectType,
    field,
  }: IGetAttributeDescriptor): Promise<IAttributeDescriptor | undefined> {
    return this.getAttributeDescriptorValue(
      field,
      objectType
    );
  }

  private async combineRelationships(
    objectType: string
  ): Promise<{ [key: string]: string } | undefined> {
    const relationships = await this.relationshipConfig();
    const objectRelationships = relationships[objectType];
    const one = objectRelationships?.one ?? {};
    const many = objectRelationships?.many ?? {};
    return { ...one, ...many }
  }

  // This function works in the same way as getAttributeDescriptorValue but returns available relationships
  private async getAvailableRelationshipsRecursive(
    field: string,
    objectType: string
  ): Promise<string[] | undefined> {
    const splitField = field.split(".");
    const combinedRelationships = await this.combineRelationships(objectType);
    if (splitField.length > 1 && combinedRelationships) {
      if (splitField[0] in combinedRelationships) {
        const relatedObjectType = combinedRelationships[splitField[0]];
        const remainingField = splitField.slice(1).join(".");
        return this.getAvailableRelationshipsRecursive(remainingField, relatedObjectType);
      }
    } else if (splitField.length === 1) {
      if (!combinedRelationships) return undefined;
      const finalRelationshipObject = combinedRelationships[splitField[0]];
      const availableRelationshipsObject = await this.combineRelationships(finalRelationshipObject);
      return availableRelationshipsObject ? Object.keys(availableRelationshipsObject) : undefined;
    }
  }

  public async getAvailableRelationships(
    objectType: string,
    field: string
  ): Promise<string[] | undefined> {
    return this.getAvailableRelationshipsRecursive(
      field,
      objectType
    )
  }

  /**
   * Determines whether a dot-delimited relationship path resolves to a `many` relationship.
   *
   * @param objectType - Root object type to start traversal from.
   * @param field - Dot-delimited relationship path (for example: `"samples.accession.id"`).
   * @returns `true` if the path contains/reaches a `many` relationship, otherwise `false`.
   */
  public async isManyDataPointsByName(
    objectType: string,
    field: string
  ): Promise<boolean> {
    const relationshipConfig = await this.relationshipConfig() as IRelationships;
    const [relationship, ...rest] = field.split(".");
    const hasMoreRelationshipJumps = rest.length > 1;

    if (relationshipConfig[objectType]?.one?.[relationship]) {
      if (hasMoreRelationshipJumps) {
        const relatedObjectType = relationshipConfig[objectType].one[relationship];
        const remainingField = rest.join(".");
        return this.isManyDataPointsByName(relatedObjectType, remainingField);
      }
      return false;
    } else if (relationshipConfig[objectType]?.many?.[relationship]) {
      return true;
    }

    return false;
  }
}


export function getFieldByName(object: TDataObjectOrNull, field: string): any {
  if (field.includes(".")) {
    const [relationship, ...rest] = field.split(".");
    const relationshipObject = object?.relationships?.[relationship];
    if (relationshipObject) {
      if (Array.isArray(relationshipObject)) {
        return relationshipObject.map((item) =>
          getFieldByName(item, rest.join("."))
        );
      }
      return getFieldByName(relationshipObject, rest.join("."));
    }
  }
  return object?.[field];
}

/**
 * Filters a list of data objects so only the first occurrence of each `id` is kept.
 *
 * @param items - List of data objects (or null list) to filter.
 * @returns A list containing unique objects by `id`.
 */
function filterUniqueById(items: TDataObjectListOrNull): TDataObjectListOrNull {
  if (!items) return [null] as TDataObjectListOrNull;

  const seenIds = new Set<string>();

  return items.filter((item) => {
    if (!item?.id) return false;
    if (seenIds.has(item.id)) return false;
    seenIds.add(item.id);
    return true;
  }) as TDataObjectListOrNull;
}

/**
 * Resolves and returns the child data object(s) reached by following a dot-delimited relationship path.
 *
 * - If `field` contains dots (e.g., `"author.address.city"`), each segment is treated as a relationship name
 *   to traverse via `object.relationships[segment]`.
 * - Relationship values may be either a single object or an array of objects; arrays are recursively mapped and
 *   flattened into a single list.
 * - If `field` does not contain a dot, the current `object` is returned as a single-item list (even if `object` is `null`).
 *
 * @param object - The starting data object from which to traverse relationships.
 * @param field - Dot-delimited relationship path to traverse. If no dot is present, no traversal occurs.
 * @returns A list of resolved child objects, or `null` if any relationship segment is missing/undefined along the path.
 */
export function getChildObjectsByName(object: TDataObjectOrNull, field: string): TDataObjectListOrNull {
  if (field.includes(".")) {
    const [relationship, ...rest] = field.split(".");
    const relationshipObject = object?.relationships?.[relationship];
    if (relationshipObject) {
      // If the relationship is an array, we need to recursively resolve the rest of the path for each item and flatten the results
      if (Array.isArray(relationshipObject)) {
        const objects = relationshipObject.flatMap(
          (item) => getChildObjectsByName(item, rest.join(".")) ?? []
        );
        return filterUniqueById(objects as TDataObjectListOrNull);
      }
      // If it's a single object, just resolve the rest of the path for that object
      return getChildObjectsByName(relationshipObject, rest.join("."));
    }
    // If any relationship segment is missing/undefined, return null
    return [null] as TDataObjectListOrNull;
  }
  // if the field does not include a dot, we assume it's a field on the current object
  return [object] as TDataObjectListOrNull;
}

/**
 * Extracts the attribute name from a field path by returning the last segment.
 * @param field - A dot-separated field path (e.g., "user.profile.name")
 * @returns The last segment of the field path (e.g., "name")
 * @example
 * getAttributeNameByField("user.profile.name") // returns "name"
 * getAttributeNameByField("id") // returns "id"
 */
export function getAttributeNameByField(field: string): string {
  return field.split(".").slice(-1)[0];
}

/**
 * Extracts the relationship name from a field path by removing the last segment.
 * @param field - A field path that may contain dot-separated segments (e.g., "relationship.field")
 * @returns The relationship name (all segments except the last one joined by dots), or an empty string if the field contains no dots
 * @example
 * getRelationshipNameByField("user.profile.name") // returns "user.profile"
 * getRelationshipNameByField("name") // returns ""
 */
export function getRelationshipNameByField(field: string): string {
  if (field.includes(".")) {
    return field.split(".").slice(0, -1).join(".");
  }
  return "";
}
