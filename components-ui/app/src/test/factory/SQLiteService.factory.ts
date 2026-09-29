/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type {
  SQLiteConnection,
  SQLiteDBConnection,
} from "@capacitor-community/sqlite";
import { vi } from "vitest";

export const createSQLiteServiceMock = () => {
  const open = vi.fn().mockResolvedValue(undefined);
  const query = vi.fn().mockResolvedValue({ values: [] });
  const run = vi.fn().mockResolvedValue({ changes: { changes: 1 } });
  const database = { open, query, run } as unknown as SQLiteDBConnection;

  const checkConnectionsConsistency = vi.fn().mockResolvedValue({ result: false });
  const isConnection = vi.fn().mockResolvedValue({ result: false });
  const addUpgradeStatement = vi.fn().mockResolvedValue(undefined);
  const retrieveConnection = vi.fn().mockResolvedValue(database);
  const createConnection = vi.fn().mockResolvedValue(database);
  const initWebStore = vi.fn().mockResolvedValue(undefined);
  const connection = {
    checkConnectionsConsistency,
    isConnection,
    addUpgradeStatement,
    retrieveConnection,
    createConnection,
    initWebStore,
  } as unknown as SQLiteConnection;

  return {
    database,
    connection,
    open,
    query,
    run,
    checkConnectionsConsistency,
    isConnection,
    addUpgradeStatement,
    retrieveConnection,
    createConnection,
    initWebStore,
  };
};