/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  SQLiteDBConnection,
} from '@capacitor-community/sqlite';
import {
  ListGetter,
} from "..";
import type {
  TDataObjectOrNull,
  IDataObject,
  IGetList,
  ISQLiteDataSource,
  IQueryResult,
  IFilter,
  IFilterOperators,
  IFilterOperatorOptions,
  TFilterOperatorType,
  IParsedFilter
} from "..";

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

    const { clause, values } = this.parseDataObjectFilter(filter);

    const queryResults = await db.query(
      `SELECT ${fields} FROM ${objectType} ${clause}`,
      values
    );

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

  /**
   * Converts an `IFilter` (currently only its `and_` clause) into a parameterised
   * `WHERE` clause and the corresponding bound values, for use with `db.query`.
   */
  private parseDataObjectFilter(filter?: IFilter): IParsedFilter {
    if (!filter?.and_) {
      return { clause: '', values: [] };
    }

    const values: any[] = [];
    const termClauses = Object.entries(filter.and_)
      .map(([column, operators]) => this.parseAndAttribute(column, operators, values))
      .filter((clause) => clause.length > 0);

    return {
      clause: termClauses.length ? `WHERE ${termClauses.join(' AND ')}` : '',
      values,
    };
  }

  private parseAndAttribute(
    column: string,
    operators: IFilterOperators,
    values: any[]
  ): string {
    const termClauses = Object.entries(operators)
      .map(([operator, options]) =>
        this.parseOperatorTerm(column, operator as TFilterOperatorType, options, values)
      )
      .filter((clause) => clause.length > 0);

    if (termClauses.length === 0) {
      return '';
    }

    return termClauses.length > 1
      ? `(${termClauses.join(' AND ')})`
      : termClauses[0];
  }

  private parseOperatorTerm(
    column: string,
    operator: TFilterOperatorType,
    options: IFilterOperatorOptions,
    values: any[]
  ): string {
    const { value, negate = false } = options;

    switch (operator) {
      case 'exists':
        return negate ? `${column} IS NULL` : `${column} IS NOT NULL`;
      case 'eq':
        values.push(value);
        return this.negatable(`${column} = ?`, column, negate);
      case 'contains':
        values.push(this.getIlikeTerm(value));
        return this.negatable(`${column} LIKE ? ESCAPE '\\'`, column, negate);
      case 'in_list':
        return this.parseInList(column, value, negate, values);
      case 'gt':
        values.push(value);
        return this.negatable(`${column} > ?`, column, negate);
      case 'gte':
        values.push(value);
        return this.negatable(`${column} >= ?`, column, negate);
      case 'lt':
        values.push(value);
        return this.negatable(`${column} < ?`, column, negate);
      case 'lte':
        values.push(value);
        return this.negatable(`${column} <= ?`, column, negate);
      default:
        return '';
    }
  }

  private parseInList(
    column: string,
    value: any[],
    negate: boolean,
    values: any[]
  ): string {
    if (!value || value.length === 0) {
      // an empty list matches nothing, so negation matches everything
      return negate ? '1=1' : '1=0';
    }

    value.forEach((v) => values.push(v));
    const placeholders = value.map(() => '?').join(', ');
    return this.negatable(`${column} IN (${placeholders})`, column, negate);
  }

  // wraps an expression so that, when negated, NULL columns are still excluded
  private negatable(expression: string, column: string, negate: boolean): string {
    return negate ? `(${column} IS NULL OR NOT (${expression}))` : expression;
  }

  private getIlikeTerm(value: string): string {
    return `%${this.escapeLike(value)}%`;
  }

  private escapeLike(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
  }

}
