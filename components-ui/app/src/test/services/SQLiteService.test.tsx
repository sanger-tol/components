/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { beforeEach, describe, expect, test, vi } from "vitest";

const capacitorMocks = vi.hoisted(() => ({
  getPlatform: vi.fn(() => "ios"),
  SQLiteConnection: vi.fn(),
}));

vi.mock("@capacitor/core", () => ({
  Capacitor: { getPlatform: capacitorMocks.getPlatform },
}));

vi.mock("@capacitor-community/sqlite", () => ({
  CapacitorSQLite: {},
  SQLiteConnection: capacitorMocks.SQLiteConnection,
}));

import { SQLiteService, SYNC_METADATA_STATEMENT } from "../../tol-ui/src";
import { createSQLiteServiceMock } from "../factory";

describe("Testing database initialization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capacitorMocks.getPlatform.mockReturnValue("ios");
  });

  test("Creates and opens a new database connection with sync metadata", async () => {
    const mocks = createSQLiteServiceMock();
    capacitorMocks.SQLiteConnection.mockImplementation(() => mocks.connection);
    const upgrades = [
      { toVersion: 1, statements: ["CREATE TABLE Species (id TEXT);"] },
    ];

    const service = new SQLiteService("offline", upgrades);
    await service.getLastSyncedAt("Species");

    expect(mocks.addUpgradeStatement).toHaveBeenCalledWith("offline", [
      {
        toVersion: 1,
        statements: [SYNC_METADATA_STATEMENT, "CREATE TABLE Species (id TEXT);"],
      },
    ]);
    expect(mocks.createConnection).toHaveBeenCalledWith(
      "offline",
      false,
      "no-encryption",
      1,
      false,
    );
    expect(mocks.retrieveConnection).not.toHaveBeenCalled();
    expect(mocks.open).toHaveBeenCalledOnce();
  });

  test("Adds a version one upgrade when the schema starts at a later version", async () => {
    const mocks = createSQLiteServiceMock();
    capacitorMocks.SQLiteConnection.mockImplementation(() => mocks.connection);
    const upgrades = [
      { toVersion: 2, statements: ["ALTER TABLE Species ADD COLUMN name TEXT;"] },
    ];

    const service = new SQLiteService("offline", upgrades);
    await service.getLastSyncedAt("Species");

    expect(mocks.addUpgradeStatement).toHaveBeenCalledWith("offline", [
      { toVersion: 1, statements: [SYNC_METADATA_STATEMENT] },
      upgrades[0],
    ]);
    expect(mocks.createConnection).toHaveBeenCalledWith(
      "offline",
      false,
      "no-encryption",
      2,
      false,
    );
  });

  test("Retrieves an existing consistent connection", async () => {
    const mocks = createSQLiteServiceMock();
    mocks.checkConnectionsConsistency.mockResolvedValue({ result: true });
    mocks.isConnection.mockResolvedValue({ result: true });
    capacitorMocks.SQLiteConnection.mockImplementation(() => mocks.connection);

    const service = new SQLiteService("offline", []);
    await service.getLastSyncedAt("Species");

    expect(mocks.retrieveConnection).toHaveBeenCalledWith("offline", false);
    expect(mocks.createConnection).not.toHaveBeenCalled();
    expect(mocks.open).toHaveBeenCalledOnce();
  });
});

describe("Testing sync metadata methods", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capacitorMocks.getPlatform.mockReturnValue("ios");
  });

  test("Returns the last sync timestamp", async () => {
    const mocks = createSQLiteServiceMock();
    mocks.query.mockResolvedValue({ values: [{ last_synced_at: 123456 }] });
    capacitorMocks.SQLiteConnection.mockImplementation(() => mocks.connection);
    const service = new SQLiteService("offline", []);

    await expect(service.getLastSyncedAt("Species")).resolves.toBe(123456);
    expect(mocks.query).toHaveBeenCalledWith(
      "SELECT last_synced_at FROM SyncMetadata WHERE table_name = ?;",
      ["Species"],
    );
  });

  test("Returns null when a table has not been synced", async () => {
    const mocks = createSQLiteServiceMock();
    capacitorMocks.SQLiteConnection.mockImplementation(() => mocks.connection);
    const service = new SQLiteService("offline", []);

    await expect(service.getLastSyncedAt("Species")).resolves.toBeNull();
  });

  test("Upserts the last sync timestamp", async () => {
    const mocks = createSQLiteServiceMock();
    capacitorMocks.SQLiteConnection.mockImplementation(() => mocks.connection);
    const service = new SQLiteService("offline", []);

    await service.setLastSyncedAt("Species", 123456);

    expect(mocks.run).toHaveBeenCalledWith(
      expect.stringMatching(
        /^INSERT INTO SyncMetadata \(table_name, last_synced_at\) VALUES \(\?, \?\)\s+ON CONFLICT\(table_name\) DO UPDATE SET last_synced_at = excluded\.last_synced_at;$/,
      ),
      ["Species", 123456],
    );
  });

  test("Treats data that has never been synced as stale", async () => {
    const mocks = createSQLiteServiceMock();
    capacitorMocks.SQLiteConnection.mockImplementation(() => mocks.connection);
    const service = new SQLiteService("offline", []);

    await expect(service.isStale("Species")).resolves.toBe(true);
  });

  test("Compares the last sync timestamp with the maximum age", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(10_000);
    const mocks = createSQLiteServiceMock();
    mocks.query
      .mockResolvedValueOnce({ values: [{ last_synced_at: 9_500 }] })
      .mockResolvedValueOnce({ values: [{ last_synced_at: 8_500 }] });
    capacitorMocks.SQLiteConnection.mockImplementation(() => mocks.connection);
    const service = new SQLiteService("offline", []);

    await expect(service.isStale("Species", 1_000)).resolves.toBe(false);
    await expect(service.isStale("Species", 1_000)).resolves.toBe(true);
    vi.useRealTimers();
  });
});
