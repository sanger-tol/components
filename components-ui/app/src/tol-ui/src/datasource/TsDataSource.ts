/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { retry } from "../services/http/retry";
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
  IDataObjectExtra,
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
  IJsonApiResponseData
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
  private baseUrl: string | undefined;
  private sourceKey: string;

  constructor({ url, apiPath, apiDataPath, dataspace, dataSourceInstanceId, client }: IDataSource = {}) {
    this.client = client ?? httpClient;
    this.url = url;
    this.apiPath = apiPath;
    this.apiDataPath = apiDataPath;
    this.dataspace = dataspace;
    this.dataSourceInstanceId = dataSourceInstanceId;
    this.baseUrl = this.initialiseBaseUrl();
    this.sourceKey = this.baseUrl ?? "default";
  }

  private initialiseBaseUrl(): string | undefined {
    // if all parts passed in are undefined, then this should be undefined overall
    if (!this.url && !this.apiPath && !this.apiDataPath && !this.dataspace) {
      return undefined;
    }

    // else join all parts together to form the baseUrl
    let baseUrl = "";
    baseUrl += this.url ? `${this.url}` : "";
    baseUrl += this.apiPath ? `${this.apiPath}` : "";
    baseUrl += this.apiDataPath ? `${this.apiDataPath}` : "";
    baseUrl += this.dataspace ? `/${this.dataspace}` : "";
    return baseUrl;
  }

  public generateEndpoint(target?: string, suffix?: string): string {
    const tg = target ? `/${target}` : "";
    const sf = suffix ? `${suffix}` : "";
    return `${tg}${sf}`;
  }

  private removeEmptyParams = (obj: Record<string, any>) => (
    Object.fromEntries(Object.entries(obj).filter(([_, v]) => v))
  );

  public getDataSourceInstanceId(): string | undefined {
    return this.dataSourceInstanceId;
  }

  public getBaseUrl(): string | undefined {
    return this.baseUrl;
  }

  private createRelationshipHandler(
    fetcher?: (args: IGetToOneRelation) => Promise<TDataObjectOrNull>
  ) {
    return {
      get: (relationships: IDataObjectExtra, relationKey: string) => {
        const relation = relationships?.[relationKey];

        if (relation === null) return null;

        if (relation?.data?.id && relation?.data?.type) {
          const includedData = relationships.__includedLookup?.[relation.data.type]?.[relation.data.id];
          return new Proxy(
            {
              ...includedData,
              id: relation.data.id,
              type: relation.data.type,
              __includedLookup: relationships.__includedLookup,
              __meta: relationships.__meta,
            },
            this.dataObjectHandler
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
    const relationshipsTarget: IDataObjectExtra = {
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
    return this.getConfig(
      this.generateEndpoint("_config/attribute_metadata")
    );
  }

  public async relationshipConfig(): Promise<object> {
    return this.getConfig(
      this.generateEndpoint("_config/relationships")
    );
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
    id
  }: IGetOne): Promise<TDataObjectOrNull> {
    return this.client()
      .get(this.generateEndpoint(objectType, `/${id}`), {
        baseURL: this.baseUrl,
      })
      .then((response: IJsonApiResponse) => {
        return this.jsonApiResponseToDataObject(response);
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
    return await this.client()
      .get(this.generateEndpoint(objectType, `${API_OPERATIONS.TO_ONE}/${id}/${relation}`), {
        baseURL: this.baseUrl,
      })
      .then((response: IJsonApiResponse) => {
        return this.jsonApiResponseToDataObject(response);
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
    return await this.client()
      .get(this.generateEndpoint(objectType), {
        baseURL: this.baseUrl,
        params: this.removeEmptyParams({
          page: page,
          page_size: pageSize,
          filter: filter,
          sort_by: sortBy,
          requested_fields: requestedFields,
        })
      })
      .then((response: IJsonApiResponse) => {
        return this.jsonApiResponseToDataObject(response);
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
        this.generateEndpoint(objectType, API_OPERATIONS.CURSOR),
        { search_after: searchAfter },
        {
          baseURL: this.baseUrl,
          params: this.removeEmptyParams({
            page: page,
            page_size: pageSize,
            filter: filter,
            requested_fields: requestedFields,
          }),
        }
      )
      .then((response: IJsonApiResponse) => {
        return [
          this.jsonApiResponseToDataObject(response),
          response.data.meta.search_after
        ];
      })
      .catch((error: any) => {
        if (error?.response?.status === 404) return null;
        throw error;
      });
  }

  public async deleteByID({ objectType, id }: IGetOne): Promise<void> {
    return await this.client()
      .delete(this.generateEndpoint(objectType, `/${id}`), {
        baseURL: this.baseUrl,
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
    return await this.client()
      .post(
        this.generateEndpoint(objectType, API_OPERATIONS.UPSERT),
        { data: payload },
        {
          baseURL: this.baseUrl,
          params: params,
        }
      )
      .then((response: IJsonApiResponse) => {
        return this.jsonApiResponseToDataObject(response);
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
