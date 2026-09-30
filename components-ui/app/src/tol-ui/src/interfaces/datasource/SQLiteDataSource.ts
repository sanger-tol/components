/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

/** Interface representing a SQLite data source. */
export interface ISQLiteDataSource {
  /** The database connection object. */
  database: any;
}

/** Interface representing the result of a query. */
export interface IQueryResult {
  /** Array of objects representing the rows returned by the query. */
  values: {
    id: string;
    [key: string]: any;
  }[];
}

/** Interface representing a parsed filter for a query. */
export interface IParsedSQLFilter {
  /** The SQL clause representing the filter (e.g., "WHERE id = ?"). */
  clause: string;
  /** The values to be used in the filter clause. */
  values: any[];
}
