/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { describe, expect, test } from "vitest";

import { BOARD_ENTITIES, deriveBoardObjectType, getEntityPrefix } from "../../tol-ui/src";

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
    const entities = BOARD_ENTITIES.ENTITIES;

    expect(deriveBoardObjectType("b_suyrg8ojo")).toBe(entities.BOARD);
    expect(deriveBoardObjectType("v_lsdifu9uj")).toBe(entities.VIEW);
    expect(deriveBoardObjectType("z_3ewrfdghE")).toBe(entities.ZONE);
    expect(deriveBoardObjectType("c_897YGHJuy")).toBe(entities.COMPONENT);
  });

  test("An error is thrown for an id that is of an unrecognised entity", () => {
    expect(() => deriveBoardObjectType("u_lksSb873s")).toThrow("Unknown board entity prefix: u");
  });

  test("An error is thrown for an invalid id", () => {
    expect(() => deriveBoardObjectType("  hu8og  8")).toThrow("Unknown board entity prefix:  ");
  });
});
