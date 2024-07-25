/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Filter, EntityMeta } from '../../models';
import { httpClient } from './httpClient';

const entityMetaPromises: {
  [baseUrl: string]: Promise<EntityMeta>
} = {};

const objectTypePromises: {
  [objectType: string]: Promise<object>
} = {};

const detailCache: {
  [objectType: string]: {
    [id: string]: number
  }
} = {};

interface GetById {
  objectType: string,
  id: string
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
  id: string | null
}

export class TsDataSource {
  entityMeta: Promise<EntityMeta>;

  constructor(
    private baseUrl?: string
  ) {
    this.baseUrl = baseUrl;
    this.entityMeta = this.getEntityMeta();
  }
  
  private async getEntityMeta(): Promise<EntityMeta> {
    const baseUrlKey = this.baseUrl || 'default';
  
    if (!entityMetaPromises[baseUrlKey]) {
      entityMetaPromises[baseUrlKey] = (async () => {
        const key = 'typesMeta-' + baseUrlKey;
        let savedTypesMeta = JSON.parse(localStorage.getItem(key) || 'null');
        const expiry = savedTypesMeta === null ? null : new Date(savedTypesMeta['expiry']);
  
        // setting now and an hour from now
        const now = new Date();
        const anHourFromNow = new Date(now);
        anHourFromNow.setHours(now.getHours() + 1);
  
        // check if typesMeta exists and is not expired
        if (expiry === null || now > expiry) {
          const attributes = await httpClient().get(
            '/_config/attribute_metadata',
            {baseURL: this.baseUrl}
          );
          const relationships = await httpClient().get(
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

        return savedTypesMeta.data as EntityMeta;
      })().finally(() => {
        delete entityMetaPromises[baseUrlKey];
      });
    }
    return entityMetaPromises[baseUrlKey];
  }

  public async getById({
    objectType,
    id
  }: GetById) : Promise<DataObject|null> {
    if (!objectTypePromises[objectType]) {
      objectTypePromises[objectType] = Promise.resolve({});
    }
    objectTypePromises[objectType] = objectTypePromises[objectType].then(async () => {
      if (!(objectType in detailCache)) detailCache[objectType] = {};
      if (id in detailCache[objectType]) return detailCache[objectType][id];
      const retrievedData = await httpClient().get(
        `/${objectType}/${id}`,
        {baseUrl: this.baseUrl}
      )
      detailCache[objectType][id] = retrievedData;
      return retrievedData;
    });
    return objectTypePromises[objectType] as Promise<DataObject>;
  }

  public async getList({
    objectType,
    page,
    pageSize,
    filter,
    sortBy
  }: GetList) : Promise<DataObject[]> {
    const x = await httpClient().get(
      `/${objectType}`,
      {
        baseUrl: this.baseUrl,
        page: page,
        page_size: pageSize,
        filter: filter,
        sort_by: sortBy
      }
    )
    return x
  }
}

/*
// in :
const transfer = {
  type: "species",
  id: '9606',
  attributes: {
    ...
  }
}

// out:
{
  objectType: "species",
  id: '9606',
  ...attributes
}


// I'd do it (ed) like this:
// 1. make a proxy based on the transfer
// 2. with a getter override/intercept
// 3. (for now) don't worry about relationships
// 4. if key == id -> transfer.id
// 5. objectType -> transfer.type
// 6. other keys (k) .... k -> transfer.attributes.k
*/