/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { describe, expect, test } from "vitest";
import { MockDataSource } from "../mocks";
import { BOARD_ENTITIES, getBoardDetails } from "../../tol-ui/src";

describe("getBoardDetails function", () => {
  test("", async () => {
    const mockDataSource = new MockDataSource({
      onPost: () => ({data: [
        {
          objectType: BOARD_ENTITIES.ENTITIES.BOARD,
          id: "b_1234567890",
          type: BOARD_ENTITIES.ENTITIES.BOARD,
          name: "First",
          children: {},
          order: [],
          owner_email: "bob@example.com",
        },
        {
          objectType: BOARD_ENTITIES.ENTITIES.BOARD,
          id: "b_1234567891",
          type: BOARD_ENTITIES.ENTITIES.BOARD,
          name: "Second",
          children: {},
          order: [],
          owner_email: "example@bob.com",
        }
      ]
    })});

    const boardDetails = await getBoardDetails(mockDataSource, "id", () => {});
    expect(boardDetails).toEqual([
      {
        id: "b_1234567890",
        title: "First",
      },
      {
        id: "b_1234567891",
        title: "Second",
      }
    ]);
  });
});
