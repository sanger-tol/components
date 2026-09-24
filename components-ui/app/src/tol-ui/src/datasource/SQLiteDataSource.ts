/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  SQLiteDBConnection,
} from '@capacitor-community/sqlite';
import {
  ListGetter,
  API_METHODS,
  API_OPERATIONS,
} from "..";
import type {
  ISQLiteDataSource,
  IGetList,
  TDataObjectOrNull,
  IQueryResult,
  IFilter
} from "..";


export interface IDataObject {
  objectType: string;
  id: string;
  [attribute: string]: any;
  relationships?: {
    [key: string]: TDataObjectOrNull | TDataObjectListOrNull;
  };
  fetchRelationships?: {
    [key: string]: Promise<TDataObjectOrNull | TDataObjectListOrNull>;
  };
}

export class SQLiteDataSource extends ListGetter {
  private database: Promise<SQLiteDBConnection>;

  constructor({ database }: ISQLiteDataSource) {
    super();
    this.database = database;
  }

  public async getList({
    objectType,
    filter,
    requestedFields,
  }: IGetList): Promise<TDataObjectOrNull[]> {
    const db = await this.database;
    const fields = requestedFields?.join(',') || '*';

    // const filter = this.parseDataObjectFilter(filter);

    const queryResults = await db.query(`SELECT ${fields} FROM ${objectType}`)

    return this.parseQueryToDataObject(objectType, queryResults);
  }

  private parseQueryToDataObject(
    objectType: string,
    results: IQueryResult
  ): IDataObject[] {
    return results['values'].map(result => {
      const { id, ...attributes } = result as any;
      return {
        objectType,
        id,
        ...attributes
      } as IDataObject;
    });
  }

  private parseDataObjectFilter(filter?: IFilter): string {
    if (!filter) {
      return '';
    }
    return ''
  }

}
