/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { describe, expect, test } from "vitest";
import type { Layout } from "react-grid-layout";

import { defineZoneWithComponentList, generateLayout, getWidgetOrder } from "../../tol-ui/src";

describe("getWidgetOrder function", () => {
  test("Components are sorted by y position", () => {
    const layout: Layout[] = [
      {
        i: "c_lygdf8dgo8",
        x: 0, y: 80,
        w: 100, h: 100,
      },
      {
        i: "c_LKJHG87ssS",
        x: 0, y: 20,
        w: 100, h: 100,
      },
      {
        i: "c_LKJh87tdGd",
        x: 0, y: 300,
        w: 100, h: 100,
      },
    ];

    expect(getWidgetOrder(layout)).toEqual([
      "c_LKJHG87ssS", "c_lygdf8dgo8", "c_LKJh87tdGd",
    ]);
  });

  test("The x position is used as a secondary sort", () => {
    const layout: Layout[] = [
      {
        i: "c_lygdf8dgo8",
        x: 0, y: 80,
        w: 100, h: 100,
      },
      {
        i: "c_LKJHG87ssS",
        x: 40, y: 20,
        w: 100, h: 100,
      },
      {
        i: "c_LKJh87tdGd",
        x: 0, y: 20,
        w: 100, h: 100,
      },
    ];

    expect(getWidgetOrder(layout)).toEqual([
      "c_LKJh87tdGd", "c_LKJHG87ssS", "c_lygdf8dgo8",
    ]);
  });
});

describe("generateLayout function", () => {
  test("A simple zone generates successfully", () => {
    const zone = defineZoneWithComponentList("test-zone", [
      { id: "one", widget_type: "md" },
      { id: "two", widget_type: "md" },
    ]);

    // Different sizes give slightly different layouts, so the width should be
    // different by breakpoint (size) kind.
    // "sm" only has 1 unit of width per row, so should be the only one to have a second row,
    // "md" should have a full row (boundary check),
    // "lg" should not fill the row,
    // even though the same sized components are used for each
    expect(generateLayout(zone)).toEqual({
      sm: [
        { i: "one", x: 0, y: 0, w: 1, h: 30 },
        { i: "two", x: 0, y: 1, w: 1, h: 30 },
      ],
      md: [
        { i: "one", x: 0, y: 0, w: 2, h: 30 },
        { i: "two", x: 2, y: 0, w: 2, h: 30 }
      ],
      lg: [
        { i: "one", x: 0, y: 0, w: 2, h: 30 },
        { i: "two", x: 2, y: 0, w: 2, h: 30 },
      ]
    });
  });
});
