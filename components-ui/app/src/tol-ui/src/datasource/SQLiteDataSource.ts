/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  SQLiteDBConnection,
} from '@capacitor-community/sqlite';
import type {
  ListGetter,
  PageGetter,
  TDataObjectOrNull,
  IDataObject,
  IAttributeDescriptor,
  IGetList,
  IGetListPage,
  ISQLiteDataSource,
  IQueryResult,
  IFilter,
  IFilterOperators,
  IFilterOperatorOptions,
  TFilterOperatorType,
  IGetAttributeDescriptor,
  IParsedFilter,
  TDataObjectListOrNull
} from "..";

export class SQLiteDataSource implements ListGetter, PageGetter {
  private database: Promise<SQLiteDBConnection>;

  constructor({ database }: ISQLiteDataSource) {
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

    return this.parseQueryToDataObject(objectType, {
      ...queryResults,
      values: queryResults.values ?? []
    });
  }

  public async getListPage({
    objectType,
    page = 1,
    pageSize = 100,
    filter,
    sortBy,
    requestedFields
  }: IGetListPage): Promise<TDataObjectListOrNull> {
    const db = await this.database;
    const fields = requestedFields?.join(',') || '*';

    const { clause, values } = this.parseDataObjectFilter(filter);
    const orderBy = this.parseSortBy(sortBy);
    const limit = Math.max(1, Math.floor(pageSize));
    const offset = (Math.max(1, Math.floor(page)) - 1) * limit;

    const queryResults = await db.query(
      `SELECT ${fields} FROM ${objectType} ${clause} ${orderBy} LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );

    return this.parseQueryToDataObject(objectType, {
      ...queryResults,
      values: queryResults.values ?? []
    });
  }

  // sortBy follows the API convention: comma-separated columns, "-" prefix for descending
  private parseSortBy(sortBy?: string): string {
    if (!sortBy) {
      return '';
    }

    const terms = sortBy
      .split(',')
      .map((term) => term.trim())
      .filter((term) => term.length > 0)
      .map((term) => {
        const descending = term.startsWith('-');
        const column = descending ? term.slice(1) : term;
        if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(column)) {
          throw new Error(`Invalid sort column: ${column}`);
        }
        return `${column} ${descending ? 'DESC' : 'ASC'}`;
      });

    return terms.length ? `ORDER BY ${terms.join(', ')}` : '';
  }

  private parseQueryToDataObject(
    objectType: string,
    results: IQueryResult
  ): IDataObject[] {
    return results['values'].map(result => {
      const { id, ...attributes } = result as any;
      // SQLite stores arrays as JSON text, so decode them back
      for (const [key, value] of Object.entries(attributes)) {
        if (typeof value === 'string' && value.startsWith('[')) {
          try {
            attributes[key] = JSON.parse(value);
          } catch {
            // not JSON, keep as string
          }
        }
      }
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

  public async getAttributeDescriptor({
  }: IGetAttributeDescriptor): Promise<IAttributeDescriptor | undefined> {

    return undefined;
  }

  /**
     * Determines whether a dot-delimited relationship path resolves to a `many` relationship.
     *
     * @param objectType - Root object type to start traversal from.
     * @param field - Dot-delimited relationship path (for example: `"samples.accession.id"`).
     * @returns always returns `false` until full implementation is done.
     */
    public async isManyDataPointsByName(
      _objectType: string,
      field: string
    ): Promise<boolean> {
      // I really do not like this approach but it is a quick way around a bigger problem.
      // Ideally we would have some kind of local attribute metadata, similar to the SQLite
      // schema.
      if (field == "goat_synonym") {
        return true;
      }
      return false;
    }

}
