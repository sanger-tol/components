/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { describe, expect, test } from "vitest";
import { MockDataSource } from "../mocks";
import { BOARD_ENTITIES, getBoardDetails } from "../../tol-ui/src";

describe("getBoardDetails function", () => {
  test("The network response is interpreted correctly", async () => {
    const mockDataSource = new MockDataSource({
      onPost: () => ({data: {
        data: [
          {
            id: "b_mock1",
            type: BOARD_ENTITIES.ENTITIES.BOARD,
            attributes: {
              title: "Second",
              children: {},
              order: [],
              owner_email: "bob@example.com",
            }
          },
          {
            id: "b_mock2",
            type: BOARD_ENTITIES.ENTITIES.BOARD,
            attributes: {
              title: "First",
              children: {},
              order: [],
              owner_email: "example@bob.com"
            }
          }
        ]
      }})
    });

    const boardDetails = await getBoardDetails(mockDataSource, "id", () => {});
    expect(boardDetails).toEqual([
      {
        id: "b_mock2",
        title: "First",
      },
      {
        id: "b_mock1",
        title: "Second",
      }
    ]);
  });
});
