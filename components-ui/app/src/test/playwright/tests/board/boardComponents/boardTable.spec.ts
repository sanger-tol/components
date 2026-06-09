// SPDX-FileCopyrightText: 2025 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { expect, test } from "@playwright/test";
import {
  addComponent,
  setBoard,
  setAuth,
  deleteComponent,
  exitEditMode,
  enterEditMode,
  clickUtilityBarButton,
  createBoardId,
} from "../../helpers";

const headless = !!(process.env.CI || process.env.HEADLESS);
const BOARD_ID = createBoardId();

test.use({ headless: headless });

test.beforeEach(async ({ page }) => {
  await setAuth(page);
  await setBoard({ page, boardID: BOARD_ID });
  await enterEditMode(page);
});

test.afterEach(async ({ page }) => {
  if (await page.getByTestId("board-exit-edit-mode-button").isVisible()) {
    await exitEditMode(page);
  }
});
  
test("manage dashboard", async ({ page }) => {
  await addComponent(page, 0, "table", "large");
  await deleteComponent(page, "table", 0);
  await expect(page.locator(".tol-table")).not.toBeVisible({ timeout: 1000 });
});

test("shows personal table configuration notices outside edit mode", async ({ page }) => {
  await addComponent(page, 0, "table", "large");
  await exitEditMode(page);

  await clickUtilityBarButton(page, "table-config-button", 0);

  await expect(
    page.getByText("Please be aware that you are editing a version of this table for yourself. If you want to edit the table for all board viewers please switch to edit mode."),
  ).toBeVisible();
  await expect(
    page.getByText("Table configuration is saved separately for logged-in and logged-out sessions. Changes made in one will not carry over to the other."),
  ).toBeVisible();
});
