/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { beforeEach, describe, expect, test } from "vitest";
import type { Layout } from "react-grid-layout";

import {
  defineZoneWithComponentList,
  generateLayout,
  getWidgetOrder,
  updateComponentConfigAndUpsert,
} from "../../tol-ui/src";

import { MockDataSource } from "../mocks";

describe("updateComponentConfigAndUpsert function", () => {
  let mockDataSource: MockDataSource;

  beforeEach(() => {
    mockDataSource = new MockDataSource({});
  });

  test("When in edit mode", async () => {
    await updateComponentConfigAndUpsert(
      "c_asdlID7j2",
      {},
      {
        id: "z_aLFJKH763Y",
        order: ["c_asdlID7j2"],
        children: {
          "c_asdlID7j2": {
            id: "c_asdlID7j2"
          }
        }
      },
      mockDataSource,
      true
    );

    expect(mockDataSource.capturedRequests).toEqual([
      {
        method: "POST",
        resource: "component:upsert",
        body: {
          data: [
            {
              type: "component",
              id: "c_asdlID7j2",
              attributes: {
                config: {}
              }
            }
          ]
        }
      }
    ]);
  });
});

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
      { id: "one", widget_type: "sm" },
      { id: "two", widget_type: "sm" },
    ]);

    // Different layout sizes can accommodate a different number of components on each row:
    // "sm" only has 1 unit of width per row, so should be the only one to have a second row;
    // "md" should have one full row (boundary check);
    // "lg" should not fill the row.
    expect(generateLayout(zone)).toEqual({
      sm: [
        { i: "one", x: 0, y: 0, w: 1, h: 10 },
        { i: "two", x: 0, y: 10, w: 1, h: 10 },
      ],
      md: [
        { i: "one", x: 0, y: 0, w: 1, h: 10 },
        { i: "two", x: 1, y: 0, w: 1, h: 10 }
      ],
      lg: [
        { i: "one", x: 0, y: 0, w: 1, h: 10 },
        { i: "two", x: 1, y: 0, w: 1, h: 10 },
      ]
    });
  });
});
