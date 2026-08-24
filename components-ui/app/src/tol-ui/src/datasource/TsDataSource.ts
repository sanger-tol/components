/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { retry } from "../services/http/retry";
import { clearExpiredToken } from "../services/auth/clearExpiredToken";
import {
  API_METHODS,
  API_OPERATIONS,
  deepCopy,
  getAttributeNameByField,
  httpClient,
  isAttributeField,
  splitRelationshipsForField,
} from "..";
import type {
  IAttributeDescriptor,
  IAttributes,
  TClient,
  IConfigPromises,
  ICustom,
  IDataSource,
  IEntityMeta,
  IEntityMetaPromises,
  IGetAttributeDescriptor,
  IGetByIds,
  IGetList,
  IGetListCursor,
  IGetListPage,
  IGetOne,
  IGetToOneRelation,
  IIncludedLookup,
  IJsonApiData,
  IJsonApiResponse,
  IJsonApiResponseData,
  IRelationshipPointer,
  IRelationships,
  ISourceDataObject,
  IUpsert,
  TCursorObjectOrNull,
  TDataObjectListOrNull,
  TDataObjectOrNull,
  TRelationshipValues,
} from "..";


const configPromises: IConfigPromises = {};
const entityMetaPromises: IEntityMetaPromises = {};

export class TsDataSource {
  private client: TClient;
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

  private fetchAndSaveConfig(resource: string, key: string): Promise<Record<string, any>> {
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
  public getConfig(resource: string): Promise<Record<string, any>> {
    const key = this.getLocalStorageKey(resource);
    const savedConfig = this.getSavedConfig(key);

    if (savedConfig && !this.isConfigExpired(savedConfig.expiry)) {
      return Promise.resolve(savedConfig.data);
    } else {
      return this.fetchAndSaveConfig(resource, key);
    }
  }

  public async attributeMetadata(): Promise<IAttributes> {
    return this.getConfig("_config/attribute_metadata") as Promise<IAttributes>;
  }

  public async relationshipConfig(): Promise<IRelationships> {
    return this.getConfig("_config/relationships") as Promise<IRelationships>;
  }

  /**
   * Determines whether a given field is available on relationships for an object type.
   *
   * @param field - The field name to check.
   * @param objectType - The object type that owns the field.
   * @returns `true` if the field has `available_on_relationships` set, otherwise `false`.
   */
  public async isAvailableOnRelationships(field: string, objectType: string): Promise<boolean> {
    const attributeMetadata = await this.attributeMetadata();
    const attribute = field.split(".").pop() ?? ""
    const attributeDescriptor = attributeMetadata[objectType]?.[attribute];
    return attributeDescriptor?.available_on_relationships ?? false;
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
    const newAttributes: IAttributes = deepCopy(attributes);
    this.addObjectTypeToAttributes(newAttributes);
    for (const entity in relationships) {
      // just deal with one-side relationships
      const oneRelationships = relationships[entity]?.one;
      if (oneRelationships) {
        for (const [relationship, objType] of Object.entries(
          oneRelationships
        )) {
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
    requestedFields
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
      body: { search_after: searchAfter, filter: filter },
      params: {
        page: page,
        page_size: pageSize,
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
    const combinedRelationships = await this.getMergedRelationshipConfig(objectType);
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

  public async getMergedRelationshipConfig(
    objectType: string
  ): Promise<TRelationshipValues> {
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
    const combinedRelationships = await this.getMergedRelationshipConfig(objectType);
    if (splitField.length > 1 && combinedRelationships) {
      if (splitField[0] in combinedRelationships) {
        const relatedObjectType = combinedRelationships[splitField[0]];
        const remainingField = splitField.slice(1).join(".");
        return this.getAvailableRelationshipsRecursive(remainingField, relatedObjectType);
      }
    } else if (splitField.length === 1) {
      if (!combinedRelationships) return undefined;
      const finalRelationshipObject = combinedRelationships[splitField[0]];
      const availableRelationshipsObject = await this.getMergedRelationshipConfig(finalRelationshipObject);
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

  /**
   * Finds the related object type whose relationship name matches a field prefix,
   * using the relationship config. Checks both `one` and `many` relationships.
   *
   * @param field - Field key to inspect (for example, `gap_species.name`).
   * @param objectType - Object type used as the lookup root in the relationship config.
   * @returns The matched related object type, or `null` when no relationship prefix matches.
   */
  public async getObjectTypeByField(
    field: string,
    objectType: string
  ): Promise<string | null> {
    const relationshipConfig = await this.relationshipConfig();
    const objectRelationships = relationshipConfig[objectType];

    for (const [relationshipName, relatedObjectType] of Object.entries(objectRelationships?.one ?? {})) {
      if (field.startsWith(relationshipName + ".")) {
        return relatedObjectType;
      }
    }
    for (const [relationshipName, relatedObjectType] of Object.entries(objectRelationships?.many ?? {})) {
      if (field.startsWith(relationshipName + ".")) {
        return relatedObjectType;
      }
    }
    return null;
  }

  /**
   * Finds the shortest relationship path between two object types using breadth-first search over
   * the relationship config. Both `one` and `many` relationships are traversed.
   *
   * @param sourceObjectType - The object type to start from (e.g. `"sample"`).
   * @param targetObjectType - The object type to reach (e.g. `"species"`).
   * @returns A dot-separated path string (e.g. `"specimen.species"`), or `null` if
   *   no path exists between the two object types.
   */
  public async findShortestRelationshipPath(
    sourceObjectType: string,
    targetObjectType?: string
  ): Promise<string | null> {
    if (sourceObjectType === targetObjectType) return "";

    const resolvedRelationshipConfig = await this.relationshipConfig();

    // Each queue entry holds the current object type and the path of relationship names taken to reach it
    const queue: Array<[string, string[]]> = [[sourceObjectType, []]];
    // Track visited types to avoid cycles
    const visited = new Set<string>([sourceObjectType]);

    while (queue.length > 0) {
      const [currentType, currentPath] = queue.shift()!;
      const relationships = resolvedRelationshipConfig[currentType];

      for (const side of ["one", "many"] as const) {
        for (const [relationshipName, relatedType] of Object.entries(relationships?.[side] ?? {})) {
          if (visited.has(relatedType)) continue;
          const newPath = [...currentPath, relationshipName];
          // Because we're using breadth-first search, the first time we reach the target is the shortest path
          if (relatedType === targetObjectType) {
            return newPath.join(".");
          }
          visited.add(relatedType);
          queue.push([relatedType, newPath]);
        }
      }
    }

    return null;
  }

  /**
   * Prefixes an attribute field with the shortest relationship path between two object types.
   *
   * @param field - Attribute field name without relationship segments.
   * @param sourceObjectType - Object type to start from.
   * @param targetObjectType - Object type that owns the attribute field.
   * @returns The prefixed field when a path exists, otherwise the original field.
   */
  private async addShortestPathToAttributeField(
    field: string,
    sourceObjectType: string,
    targetObjectType: string
  ): Promise<string | null> {
    const shortestPath = await this.findShortestRelationshipPath(
      sourceObjectType,
      targetObjectType
    );
    // If no path exists, return null to indicate that the field cannot be resolved from the source object type.
    if (shortestPath === null) return null;
    
    if (shortestPath === "") return field;
    return `${shortestPath}.${field}`;
  }

  /**
   * Rewrites a relationship field to use the shortest relationship path while
   * preserving the final attribute segment.
   *
   * @param field - Original relationship field (e.g. `"specimens.samples.name"`).
   * @param sourceObjectType - Object type the field should be relative to.
   * @param resolvedRelationshipConfig - Relationship config to use for traversal.
   * @returns Shortened relationship field, `null` if no path exists, or the
   *   bare attribute name if source and target are the same type.
   */
  private async addShortestPathToRelationshipField(
    field: string,
    sourceObjectType: string,
    resolvedRelationshipConfig: IRelationships
  ): Promise<string | null> {
    const attribute = getAttributeNameByField(field);

    // Resolve the final object type reached by the full relationship chain.
    let currentObjectType = sourceObjectType;
    for (const relationshipName of splitRelationshipsForField(field)) {
      const nextObjectType =
        resolvedRelationshipConfig[currentObjectType]?.one?.[relationshipName] ??
        resolvedRelationshipConfig[currentObjectType]?.many?.[relationshipName];
      if (!nextObjectType) return null;
      currentObjectType = nextObjectType;
    }

    const shortestPath = await this.findShortestRelationshipPath(
      sourceObjectType,
      currentObjectType
    );

    if (shortestPath === null) return null;
    if (shortestPath === "") return attribute;

    return `${shortestPath}.${attribute}`;
  }

  /**
    * Returns a field that uses the shortest relationship path from `sourceObjectType`.
    *
    * @param field - Field name, with or without relationship segments.
    * @param sourceObjectType - The object type that the field should be relative to.
    * @param targetObjectType - Object type that owns `field` when `field` has no relationship segments.
    * @returns Shortened field, or the original field if no valid path is found.
   */
  public async findShortestRelationshipField(
    field: string,
    sourceObjectType: string,
    targetObjectType: string
  ): Promise<string | null> {
    const resolvedRelationshipConfig = await this.relationshipConfig();

    // For attributes just add the shortest relationship path
    if (isAttributeField(field)) {
      return this.addShortestPathToAttributeField(
        field,
        sourceObjectType,
        targetObjectType
      );
    }

    // For relationship fields, find the shortest path to the final object type and preserve the attribute segment
    return this.addShortestPathToRelationshipField(
      field,
      sourceObjectType,
      resolvedRelationshipConfig
    );
  }
}
