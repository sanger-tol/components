/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Capacitor } from '@capacitor/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  CapacitorSQLiteUpgradeOptions,
  SQLiteDBConnection,
} from '@capacitor-community/sqlite';
import type { HTMLJeepSqliteElement } from 'jeep-sqlite';

let sqliteConnection: SQLiteConnection | undefined;
let dbPromise: ReturnType<typeof getDatabase> | undefined;

async function initOfflineStorage(): Promise<SQLiteConnection> {
  if (sqliteConnection) return sqliteConnection;
  if (Capacitor.getPlatform() === 'web') {
    // Inject the <jeep-sqlite> custom element programmatically —
    // consuming apps don't need to touch their HTML at all
    const { defineCustomElements } = await import('jeep-sqlite/loader');
    await defineCustomElements(window);

    const jeepEl = document.createElement('jeep-sqlite') as HTMLJeepSqliteElement;
    // Enable auto-save for the web platform (saves straight to disk after a write operation)
    jeepEl.autoSave = true;
    document.body.appendChild(jeepEl);
    await customElements.whenDefined('jeep-sqlite');

    sqliteConnection = new SQLiteConnection(CapacitorSQLite);
    await sqliteConnection.initWebStore();
  } else {
    sqliteConnection = new SQLiteConnection(CapacitorSQLite);
  }

  return sqliteConnection;
}

async function getDatabase(
  databaseName: string,
  upgradeStatements: CapacitorSQLiteUpgradeOptions[]
): Promise<SQLiteDBConnection> {
  const conn = await initOfflineStorage();
  const isConn = (await conn.isConnection(databaseName, false)).result;

  await conn.addUpgradeStatement(databaseName, upgradeStatements);

  const db = isConn
    ? await conn.retrieveConnection(databaseName, false)
    : await conn.createConnection(databaseName, false, 'no-encryption', upgradeStatements.length, false);

  await db.open();
  return db;
}

export function getSQLiteDatabase(
  databaseName: string,
  upgrades: CapacitorSQLiteUpgradeOptions[]
) {
  if (!dbPromise) {
    dbPromise = getDatabase(databaseName, upgrades);
  }
  return dbPromise;
}