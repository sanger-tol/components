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
});
