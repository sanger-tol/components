/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import "@testing-library/jest-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";

const capacitorMocks = vi.hoisted(() => ({
  getPlatform: vi.fn(() => "ios"),
  saveToStore: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@capacitor/core", () => ({
  Capacitor: { getPlatform: capacitorMocks.getPlatform },
}));

vi.mock("@capacitor-community/sqlite", () => ({
  CapacitorSQLite: { saveToStore: capacitorMocks.saveToStore },
}));

import { SQLiteDataSource } from "../../tol-ui/src";
import { createSQLiteDatabaseMock } from "../factory";

describe("Testing getList function", () => {
  test("Returns data objects from SQLite rows", async () => {
    const { database, query } = createSQLiteDatabaseMock([
      {
        id: "species-1",
        name: "Test species",
        synonyms: '["first","second"]',
        description: "[not JSON",
      },
    ]);
    const dataSource = new SQLiteDataSource({ database });

    const dataObjects = await dataSource.getList({ objectType: "species" });

    expect(query).toHaveBeenCalledWith("SELECT * FROM species ", []);
    expect(dataObjects).toEqual([
      {
        objectType: "species",
        id: "species-1",
        name: "Test species",
        synonyms: ["first", "second"],
        description: "[not JSON",
      },
    ]);
  });

  test("Requests only the selected fields", async () => {
    const { database, query } = createSQLiteDatabaseMock();
    const dataSource = new SQLiteDataSource({ database });

    await dataSource.getList({
      objectType: "species",
      requestedFields: ["id", "name"],
    });

    expect(query).toHaveBeenCalledWith("SELECT id,name FROM species ", []);
  });

  test("Handles query results without values", async () => {
    const { database, query } = createSQLiteDatabaseMock();
    query.mockResolvedValueOnce({});
    const dataSource = new SQLiteDataSource({ database });

    await expect(dataSource.getList({ objectType: "species" })).resolves.toEqual([]);
  });
});

describe("Testing getListPage function", () => {
  test("Applies sorting, limit, and page offset", async () => {
    const { database, query } = createSQLiteDatabaseMock();
    const dataSource = new SQLiteDataSource({ database });

    await dataSource.getListPage({
      objectType: "species",
      page: 3,
      pageSize: 25,
      sortBy: "name,-created_at",
      requestedFields: ["id", "name"],
    });

    expect(query).toHaveBeenCalledWith(
      "SELECT id,name FROM species  ORDER BY name ASC, created_at DESC LIMIT ? OFFSET ?",
      [25, 50],
    );
  });

  test("Uses the default page and page size", async () => {
    const { database, query } = createSQLiteDatabaseMock();
    const dataSource = new SQLiteDataSource({ database });

    await dataSource.getListPage({ objectType: "species" });

    expect(query).toHaveBeenCalledWith(
      "SELECT * FROM species   LIMIT ? OFFSET ?",
      [100, 0],
    );
  });

  test("Clamps and floors invalid pagination values", async () => {
    const { database, query } = createSQLiteDatabaseMock();
    const dataSource = new SQLiteDataSource({ database });

    await dataSource.getListPage({
      objectType: "species",
      page: -2,
      pageSize: 2.9,
    });

    expect(query).toHaveBeenCalledWith(
      "SELECT * FROM species   LIMIT ? OFFSET ?",
      [2, 0],
    );
  });

  test("Rejects an invalid sort column before querying", async () => {
    const { database, query } = createSQLiteDatabaseMock();
    const dataSource = new SQLiteDataSource({ database });

    await expect(
      dataSource.getListPage({
        objectType: "species",
        sortBy: "name; DROP TABLE species",
      }),
    ).rejects.toThrow("Invalid sort column: name; DROP TABLE species");
    expect(query).not.toHaveBeenCalled();
  });
});

describe("Testing filters", () => {
  let query: ReturnType<typeof createSQLiteDatabaseMock>["query"];
  let dataSource: SQLiteDataSource;

  beforeEach(() => {
    const databaseMock = createSQLiteDatabaseMock();
    query = databaseMock.query;
    dataSource = new SQLiteDataSource({ database: databaseMock.database });
  });

  test("Combines attributes and operators with bound values", async () => {
    await dataSource.getList({
      objectType: "species",
      filter: {
        and_: {
          score: { gte: { value: 10 }, lt: { value: 20 } },
          status: { eq: { value: "active" } },
        },
      },
    });

    expect(query).toHaveBeenCalledWith(
      "SELECT * FROM species WHERE (score >= ? AND score < ?) AND status = ?",
      [10, 20, "active"],
    );
  });

  test("Escapes contains filter wildcards", async () => {
    await dataSource.getList({
      objectType: "species",
      filter: {
        and_: { name: { contains: { value: "50%_\\complete" } } },
      },
    });

    expect(query).toHaveBeenCalledWith(
      "SELECT * FROM species WHERE name LIKE ? ESCAPE '\\'",
      ["%50\\%\\_\\\\complete%"],
    );
  });

  test("Builds list and existence filters", async () => {
    await dataSource.getList({
      objectType: "species",
      filter: {
        and_: {
          id: { in_list: { value: ["one", "two"] } },
          retired_at: { exists: { value: true, negate: true } },
        },
      },
    });

    expect(query).toHaveBeenCalledWith(
      "SELECT * FROM species WHERE id IN (?, ?) AND retired_at IS NULL",
      ["one", "two"],
    );
  });

  test.each([
    [false, "1=0"],
    [true, "1=1"],
  ])("Handles an empty list with negate=%s", async (negate, clause) => {
    await dataSource.getList({
      objectType: "species",
      filter: { and_: { id: { in_list: { value: [], negate } } } },
    });

    expect(query).toHaveBeenCalledWith(
      `SELECT * FROM species WHERE ${clause}`,
      [],
    );
  });

  test("Wraps negated comparisons", async () => {
    await dataSource.getList({
      objectType: "species",
      filter: { and_: { score: { gt: { value: 100, negate: true } } } },
    });

    expect(query).toHaveBeenCalledWith(
      "SELECT * FROM species WHERE (score IS NULL OR NOT (score > ?))",
      [100],
    );
  });
});

describe("Testing upsert function", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capacitorMocks.getPlatform.mockReturnValue("ios");
  });

  test("Persists web writes after committing the transaction", async () => {
    capacitorMocks.getPlatform.mockReturnValue("web");
    const mock = createSQLiteDatabaseMock();
    mock.commitTransaction.mockImplementation(async () => {
      expect(capacitorMocks.saveToStore).not.toHaveBeenCalled();
    });
    capacitorMocks.saveToStore.mockImplementationOnce(async () => {
      expect(mock.commitTransaction).toHaveBeenCalledOnce();
    });
    const dataSource = new SQLiteDataSource({ database: mock.database });

    await dataSource.upsert({ objectType: "sample", payload: [{ type: "sample", id: "one" }] });

    expect(capacitorMocks.saveToStore).toHaveBeenCalledWith({ database: "offline" });
    expect(mock.rollbackTransaction).not.toHaveBeenCalled();
  });

  test("Does not roll back an already committed transaction if web persistence fails", async () => {
    capacitorMocks.getPlatform.mockReturnValue("web");
    capacitorMocks.saveToStore.mockRejectedValueOnce(new Error("Storage failed"));
    const mock = createSQLiteDatabaseMock();
    const dataSource = new SQLiteDataSource({ database: mock.database });

    await expect(dataSource.upsert({
      objectType: "sample", payload: [{ type: "sample", id: "one" }],
    })).rejects.toThrow("Storage failed");

    expect(mock.commitTransaction).toHaveBeenCalledOnce();
    expect(mock.rollbackTransaction).not.toHaveBeenCalled();
  });

  test("Binds values, updates on ID conflicts, and returns stored rows", async () => {
    const mock = createSQLiteDatabaseMock([{ id: "one", name: "O'Brien", synonyms: '["first"]' }]);
    const dataSource = new SQLiteDataSource({ database: mock.database });

    const result = await dataSource.upsert({
      objectType: "species",
      payload: [{ type: "species", id: "one", attributes: { name: "O'Brien", synonyms: ["first"] } }],
    });

    expect(mock.beginTransaction).toHaveBeenCalledOnce();
    expect(mock.run).toHaveBeenCalledWith(
      'INSERT INTO "species" ("id", "name", "synonyms") VALUES (?, ?, ?) ON CONFLICT("id") DO UPDATE SET "name" = excluded."name", "synonyms" = excluded."synonyms";',
      ["one", "O'Brien", '["first"]'],
      false,
    );
    expect(mock.query).toHaveBeenCalledWith('SELECT * FROM "species" WHERE "id" = ?', ["one"]);
    expect(result).toEqual([{ objectType: "species", id: "one", name: "O'Brien", synonyms: ["first"] }]);
    expect(mock.commitTransaction).toHaveBeenCalledOnce();
    expect(mock.rollbackTransaction).not.toHaveBeenCalled();
    expect(capacitorMocks.saveToStore).not.toHaveBeenCalled();
  });

  test("Serializes dates and booleans, preserves null, and omits undefined attributes", async () => {
    const mock = createSQLiteDatabaseMock();
    const dataSource = new SQLiteDataSource({ database: mock.database });
    const date = new Date("2026-10-26T12:00:00Z");

    await dataSource.upsert({
      objectType: "record",
      payload: [{ type: "record", id: "one", attributes: { created_at: date, active: true, notes: null, name: undefined, id: "ignored" } }],
    });

    expect(mock.run).toHaveBeenCalledWith(
      expect.not.stringContaining('"name"'),
      ["one", date.toISOString(), 1, null],
      false,
    );
  });

  test("Handles an ID-only payload without replacing existing rows", async () => {
    const mock = createSQLiteDatabaseMock();
    const dataSource = new SQLiteDataSource({ database: mock.database });

    await dataSource.upsert({ objectType: "sample", payload: [{ type: "sample", id: "one" }] });

    expect(mock.run).toHaveBeenCalledWith(
      'INSERT INTO "sample" ("id") VALUES (?) ON CONFLICT("id") DO NOTHING;',
      ["one"],
      false,
    );
  });

  test("Skips empty payloads", async () => {
    const mock = createSQLiteDatabaseMock();
    const dataSource = new SQLiteDataSource({ database: mock.database });

    await expect(dataSource.upsert({ objectType: "sample", payload: [] })).resolves.toEqual([]);
    expect(mock.beginTransaction).not.toHaveBeenCalled();
  });

  test("Rolls back the batch and rethrows when a later write fails", async () => {
    const mock = createSQLiteDatabaseMock();
    const error = new Error("Constraint failed");
    mock.run.mockResolvedValueOnce({}).mockRejectedValueOnce(error);
    const dataSource = new SQLiteDataSource({ database: mock.database });

    await expect(dataSource.upsert({
      objectType: "sample",
      payload: [{ type: "sample", id: "one" }, { type: "sample", id: "two" }],
    })).rejects.toThrow(error);
    expect(mock.rollbackTransaction).toHaveBeenCalledOnce();
    expect(mock.commitTransaction).not.toHaveBeenCalled();
  });

  test.each([
    { objectType: "sample; DROP TABLE sample", item: { type: "sample", id: "one" }, message: "Invalid SQL identifier" },
    { objectType: "sample", item: { type: "sample", id: "one", attributes: { "bad-column": "value" } }, message: "Invalid SQL identifier" },
    { objectType: "sample", item: { type: "sample" }, message: "requires an ID" },
    { objectType: "sample", item: { type: "sample", id: "one", relationships: { species: {} } }, message: "foreign-key attributes" },
  ])("Rejects unsupported or unsafe input: $message", async ({ objectType, item, message }) => {
    const mock = createSQLiteDatabaseMock();
    const dataSource = new SQLiteDataSource({ database: mock.database });

    await expect(dataSource.upsert({ objectType, payload: [item] })).rejects.toThrow(message);
    expect(mock.run).not.toHaveBeenCalled();
    expect(mock.commitTransaction).not.toHaveBeenCalled();
  });
});

describe("Testing metadata functions", () => {
  test("Returns no attribute descriptor", async () => {
    const { database } = createSQLiteDatabaseMock();
    const dataSource = new SQLiteDataSource({ database });

    await expect(
      dataSource.getAttributeDescriptor({ objectType: "species", field: "name" }),
    ).resolves.toBeUndefined();
  });

  test("Identifies goat_synonym as a to-many field", async () => {
    const { database } = createSQLiteDatabaseMock();
    const dataSource = new SQLiteDataSource({ database });

    await expect(
      dataSource.isManyDataPointsByName("species", "goat_synonym"),
    ).resolves.toBe(true);
    await expect(
      dataSource.isManyDataPointsByName("species", "name"),
    ).resolves.toBe(false);
  });
});

