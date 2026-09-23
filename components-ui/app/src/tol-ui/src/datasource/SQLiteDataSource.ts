/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  SQLiteDBConnection,
} from '@capacitor-community/sqlite';
import { clearExpiredToken } from "../services/auth/clearExpiredToken";
import {
  API_METHODS,
  API_OPERATIONS,
} from "..";
import type {
  ISQLiteDataSource,
} from "..";

export class SQLiteDataSource {
  private database: Promise<SQLiteDBConnection>;

  constructor({ database }: ISQLiteDataSource) {
    this.database = database;
  }

}
