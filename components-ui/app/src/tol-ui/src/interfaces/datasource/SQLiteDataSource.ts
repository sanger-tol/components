/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export interface ISQLiteDataSource {
  database: any;
}

export interface IQueryResult {
  values: {
    id: string;
    [key: string]: any;
  }[];
}

export interface IParsedFilter {
  clause: string;
  values: any[];
}
