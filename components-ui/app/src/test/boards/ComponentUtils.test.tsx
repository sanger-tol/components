/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { describe, expect, test } from "vitest";
import type { Layout } from "react-grid-layout";
import { getWidgetOrder } from "../../tol-ui/src";

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
