/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Filter } from '../../models/Filter';
import { httpClient } from './httpClient';


const promises: {
  [type: string]: Promise<object>
} = {};

const cache: {
  [key: string]: {
    [key: string]: number
  }
} = {};

interface IGetById {
  id: string,
  type: string
}

export class TsDataSource {
  constructor(private baseUrl?: string) {
    this.baseUrl = baseUrl;
  }

  async getById({
    id,
    type
  }: IGetById) : Promise<object> {
    if (!promises[type]) {
      promises[type] = Promise.resolve({});
    }
    promises[type] = promises[type].then(async () => {
      if (!(type in cache)) cache[type] = {};
      if (id in cache[type]) return cache[type][id];
      const retrievedData = await httpClient().get(
        '/' + type + '/' + id,
        {baseUrl: this.baseUrl}
      )
      cache[type][id] = retrievedData;
      return retrievedData;
    });
    return promises[type];
  }
}


















interface IAttributes {
  [id: string]: object
}

interface IRelationships {
  [id: string]: IRelationship
}

interface IRelationship {
  one?: IValues,
  many?: IValues,
  foreign_keys?: IValues
}

interface IValues {
  [id: string]: string
}

export interface IEntityMeta {
  attributes: IAttributes,
  relationships: IRelationships
}

export class EntityMeta {
  static promises: {
    [key: string]: Promise<IEntityMeta>
  } = {};
  
  static async getTypesMeta(
    baseUrl?: string,
    attributeMetadataUrl?: string,
    relationshipsUrl?: string
  ): Promise<IEntityMeta> {
    const baseUrlKey = baseUrl || 'default';
  
    if (!this.promises[baseUrlKey]) {
      this.promises[baseUrlKey] = (async () => {
        const key = 'typesMeta-' + baseUrlKey;
        let savedTypesMeta = JSON.parse(localStorage.getItem(key) || 'null');
        const expiry = savedTypesMeta === null ? null : new Date(savedTypesMeta['expiry']);
  
        // setting now and an hour from now
        const now = new Date();
        const anHourFromNow = new Date(now);
        anHourFromNow.setHours(now.getHours() + 1);
  
        // check if typesMeta exists and is not expired
        if (expiry === null || now > expiry) {
          const attributes = await Get.list(
            attributeMetadataUrl ? attributeMetadataUrl : '/_config/attribute_metadata',
            baseUrl
          );
          const relationships = await Get.list(
            relationshipsUrl ? relationshipsUrl : '/_config/relationships',
            baseUrl
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
  
        return savedTypesMeta.data as IEntityMeta;
      })().finally(() => {
        delete this.promises[baseUrlKey];
      });
    }
    return this.promises[baseUrlKey];
  }
}
