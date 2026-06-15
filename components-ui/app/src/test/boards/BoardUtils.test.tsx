/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { describe, expect, test } from "vitest";

import { BOARD_ENTITIES, deriveBoardChildObjectType, deriveBoardObjectType, getEntityPrefix } from "../../tol-ui/src";

describe("getEntityPrefix function", () => {
  test("The correct prefix is returned for each type of entity", () => {
    expect(getEntityPrefix("board")).toBe("b");
    expect(getEntityPrefix("view")).toBe("v");
    expect(getEntityPrefix("zone")).toBe("z");
    expect(getEntityPrefix("component")).toBe("c");
  });
});

describe("deriveBoardObjectType function", () => {
  test("The correct prefix is returned for an id of each board entity kind", () => {
    const { BOARD, VIEW, ZONE, COMPONENT } = BOARD_ENTITIES.ENTITIES;

    expect(deriveBoardObjectType("b_suyrg8ojo")).toBe(BOARD);
    expect(deriveBoardObjectType("v_lsdifu9uj")).toBe(VIEW);
    expect(deriveBoardObjectType("z_3ewrfdghE")).toBe(ZONE);
    expect(deriveBoardObjectType("c_897YGHJuy")).toBe(COMPONENT);
  });

  test("An error is thrown for an id that is of an unrecognised entity", () => {
    expect(() => deriveBoardObjectType("u_lksSb873s")).toThrow("Unknown board entity prefix: u");
  });

  test("An error is thrown for an invalid id", () => {
    expect(() => deriveBoardObjectType("  hu8og  8")).toThrow("Unknown board entity prefix:  ");
  });
});

describe("deriveBoardChildObjectType function", () => {
  test("Each valid child entity type is determined correctly", () => {
    const { BOARD, VIEW, ZONE, COMPONENT } = BOARD_ENTITIES.ENTITIES;

    expect(deriveBoardChildObjectType(BOARD)).toBe(VIEW);
    expect(deriveBoardChildObjectType(VIEW)).toBe(ZONE);
    expect(deriveBoardChildObjectType(ZONE)).toBe(COMPONENT);
  });

  test("The last entity in the hierarchy has no child", () => {
    expect(() => deriveBoardChildObjectType(BOARD_ENTITIES.ENTITIES.COMPONENT)).toThrow(
      `Unknown parent object type: ${BOARD_ENTITIES.ENTITIES.COMPONENT}`
    );
  });

  test("An error is thrown on a non-existant board entity kind", () => {
    expect(() => deriveBoardChildObjectType("cool object 😎")).toThrow(
      "Unknown parent object type: cool object 😎"
    );
  });
});
