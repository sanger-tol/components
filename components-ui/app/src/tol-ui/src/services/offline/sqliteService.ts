/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

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
import { SYNC_METADATA_STATEMENT, ONE_DAY_MS } from '../..';

/**
 * @autodoc
 * 
 * SqliteService is a service class that manages SQLite database connections and schema upgrades,
 * providing methods to interact with the local database and track synchronization metadata.
 */
export class SqliteService {
  private sqliteConnection: SQLiteConnection | undefined;
  private readonly dbPromise: Promise<SQLiteDBConnection>;

  constructor(
    /* The name of the database to connect to. */
    private readonly databaseName: string,
    /* The list of upgrade options for the database schema (similar to alembic in SQLAlchemy). */
    private readonly upgrades: CapacitorSQLiteUpgradeOptions[]
  ) {
    this.dbPromise = this.getDatabase();
  }

  /**
   * Initializes the offline storage by setting up the SQLite connection.
   * For the web platform, it injects the <jeep-sqlite> custom element and initializes the web store.
   * For other platforms, it simply creates a new SQLite connection.
   */
  private async initOfflineStorage(): Promise<SQLiteConnection> {
    if (this.sqliteConnection) return this.sqliteConnection;
    if (Capacitor.getPlatform() === 'web') {
      // Inject the <jeep-sqlite> custom element programmatically
      const { defineCustomElements } = await import('jeep-sqlite/loader');
      await defineCustomElements(window);

      const jeepEl = document.createElement('jeep-sqlite') as HTMLJeepSqliteElement;
      // Enable auto-save for the web platform (saves straight to disk after a write operation)
      jeepEl.autoSave = true;
      document.body.appendChild(jeepEl);
      await customElements.whenDefined('jeep-sqlite');

      this.sqliteConnection = new SQLiteConnection(CapacitorSQLite);
      await this.sqliteConnection.initWebStore();
    } else {
      this.sqliteConnection = new SQLiteConnection(CapacitorSQLite);
    }

    return this.sqliteConnection;
  }

  /**
   * Builds the list of SQLite schema upgrades, ensuring the sync metadata table is included.
   * If the first upgrade is not for version 1, it inserts an upgrade for version 1 with the sync metadata table.
   * Otherwise, it prepends the sync metadata table to the statements of the first upgrade.
   */
  private buildUpgrades(): CapacitorSQLiteUpgradeOptions[] {
    const [first, ...rest] = this.upgrades;
    // Looks for the first version of upgrades in the schema and inserts the sync table
    if (!first || first.toVersion !== 1) {
      return [{ toVersion: 1, statements: [SYNC_METADATA_STATEMENT] }, first, ...rest].filter(
        (upgrade): upgrade is CapacitorSQLiteUpgradeOptions => upgrade !== undefined
      );
    }
    return [
      { ...first, statements: [SYNC_METADATA_STATEMENT, ...first.statements] },
      ...rest,
    ];
  }

  /**
   * Retrieves the SQLite database connection, creating it if it doesn't already exist.
   */
  private async getDatabase(): Promise<SQLiteDBConnection> {
    const upgrades = this.buildUpgrades();
    const conn = await this.initOfflineStorage();
    const isConn = (await conn.isConnection(this.databaseName, false)).result;

    await conn.addUpgradeStatement(this.databaseName, upgrades);

    const db = isConn
      ? await conn.retrieveConnection(this.databaseName, false)
      : await conn.createConnection(
          this.databaseName,
          false,
          'no-encryption',
          upgrades.length,
          false
        );

    await db.open();
    return db;
  }

  /**
   * Retrieves the timestamp of the last sync for the specified table.
   *
   * @param tableName - The name of the table to check.
   * @returns The timestamp of the last sync for the specified table, or `null` if it has never been synced.
   */
  async getLastSyncedAt(tableName: string): Promise<number | null> {
    const db = await this.dbPromise;
    const result = await db.query(
      `SELECT last_synced_at FROM SyncMetadata WHERE table_name = ?;`,
      [tableName]
    );
    return result.values?.[0]?.last_synced_at ?? null;
  }

  /**
   * Sets the timestamp of the last sync for the specified table.
   *
   * @param tableName - The name of the table to set the last sync timestamp for.
   * @param timestamp - The timestamp to set as the last sync time.
   */
  async setLastSyncedAt(tableName: string, timestamp: number): Promise<void> {
    const db = await this.dbPromise;
    await db.run(
      `INSERT INTO SyncMetadata (table_name, last_synced_at) VALUES (?, ?)
       ON CONFLICT(table_name) DO UPDATE SET last_synced_at = excluded.last_synced_at;`,
      [tableName, timestamp]
    );
  }

  /**
   * Determines whether the data for the specified table is stale based on the maximum allowed age.
   *
   * @param tableName - The name of the table to check.
   * @param maxAgeMs - The maximum allowed age in milliseconds before the data is considered stale. Defaults to one day.
   * @returns `true` if the data is stale or has never been synced, otherwise `false`.
   */
  async isStale(tableName: string, maxAgeMs = ONE_DAY_MS): Promise<boolean> {
    const lastSynced = await this.getLastSyncedAt(tableName);
    if (lastSynced === null) return true; // never synced
    return Date.now() - lastSynced > maxAgeMs;
  }
}