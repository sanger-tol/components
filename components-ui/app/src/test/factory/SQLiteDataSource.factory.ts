/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { SQLiteDBConnection } from "@capacitor-community/sqlite";
import { vitest } from "vitest";

export const createSQLiteDatabaseMock = (values: Record<string, unknown>[] = []) => {
  const query = vitest.fn().mockResolvedValue({ values });
  const run = vitest.fn().mockResolvedValue({ changes: { changes: 1 } });
  const beginTransaction = vitest.fn().mockResolvedValue(undefined);
  const commitTransaction = vitest.fn().mockResolvedValue(undefined);
  const rollbackTransaction = vitest.fn().mockResolvedValue(undefined);
  const getConnectionDBName = vitest.fn().mockReturnValue("offline");
  const database = {
    query, run, beginTransaction, commitTransaction, rollbackTransaction, getConnectionDBName,
  } as unknown as SQLiteDBConnection;

  return {
    database: Promise.resolve(database),
    query,
    run,
    beginTransaction,
    commitTransaction,
    rollbackTransaction,
    getConnectionDBName,
  };
};