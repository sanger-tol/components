/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { beforeEach, describe, expect, test, vi } from "vitest";
import { MockDataSource } from "../mocks";
import { onViewTitleSave, updateViewInUrl } from "../../tol-ui/src";
import type { IBoard } from "../../tol-ui/src";

describe("onViewTitleSave function", () => {
  let mockDataSource: MockDataSource;

  beforeEach(() => {
    // No data returned; we just want to check which requests are sent
    mockDataSource = new MockDataSource({});
  });

  test("No difference in title results in no upsert", async () => {
    const board: IBoard = {
      id: "b_mock",
      order: ["v_mock"],
      children: {
        "v_mock": {
          title: "View Title",
          id: "v_mock",
          order: [],
          children: {},
        }
      },
    };

    const newBoard = await onViewTitleSave("View Title", "v_mock", board, mockDataSource);
    expect(mockDataSource.capturedRequests.length).toBe(0);
    expect(newBoard).toBeUndefined();
  });

  test("Title is correctly modified", async () => {
    const board: IBoard = {
      id: "b_mock",
      order: ["v_mock1", "v_mock2"],
      children: {
        "v_mock1": {
          title: "First View",
          id: "v_mock1",
          order: [],
          children: {},
        },
        "v_mock2": {
          title: "Second View",
          id: "v_mock2",
          order: [],
          children: {},
        }
      },
    };

    const newBoard = await onViewTitleSave("New Title", "v_mock2", board, mockDataSource);
    expect(mockDataSource.capturedRequests.length).toBe(1);
    expect(newBoard).toEqual({
      id: "b_mock",
      order: ["v_mock1", "v_mock2"],
      children: {
        "v_mock1": {
          title: "First View",
          id: "v_mock1",
          order: [],
          children: {},
        },
        "v_mock2": {
          title: "New Title",
          id: "v_mock2",
          order: [],
          children: {},
        }
      }
    } as IBoard);
  });
});

describe("updateViewInUrl function", () => {
  test("The update occurs successfully", () => {
    window.history.pushState({}, "", "/?view=v_one");
    const spy = vi.spyOn(window.history, "replaceState");

    updateViewInUrl("v_two");

    expect(location.search).toBe("?view=v_two");
    expect(spy).toHaveBeenCalledWith(null, "", "?view=v_two");
  });
});
