/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import "@testing-library/jest-dom";
import { beforeEach, describe, expect, test } from "vitest";

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

