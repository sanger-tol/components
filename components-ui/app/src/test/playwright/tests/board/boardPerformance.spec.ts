// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { test } from "@playwright/test";

import {
  addComponent,
  configureTable,
  createBoardId,
  enterEditMode,
  exitEditMode,
  isInHeadlessMode,
  setAuth,
  setBoard,
} from "../helpers";

let BOARD_ID: string;

test.use({ headless: isInHeadlessMode });

test.beforeEach(async ({ page }) => {
  BOARD_ID = createBoardId();
  await setAuth(page);
  await setBoard(page, BOARD_ID);
  await enterEditMode(page);
});

test.afterEach(async ({ page }) => {
  await exitEditMode(page);
});

test("big table", async ({ page }) => {
  await addComponent(page, 0, "table");
  await configureTable(
    page,
    page.getByTestId("board-component-table"),
    {
      // activeColumns: ["Species Name", "Priority"],
      defaultSort: "Priority"
    }
  )
});
