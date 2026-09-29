/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { SQLiteDBConnection } from "@capacitor-community/sqlite";
import { vitest } from "vitest";

export const createSQLiteDatabaseMock = (values: Record<string, unknown>[] = []) => {
  const query = vitest.fn().mockResolvedValue({ values });
  const database = { query } as unknown as SQLiteDBConnection;

  return {
    database: Promise.resolve(database),
    query,
  };
};