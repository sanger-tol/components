// SPDX-FileCopyrightText: 2025 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { expect, test } from "@playwright/test";
import {
  addComponent,
  setBoard,
  setAuth,
  deleteFirstComponent,
  exitEditMode,
  enterEditMode,
  clickUtilityBarButton,
} from "../../helpers";

const headless = !!(process.env.CI || process.env.HEADLESS);
const BOARD_ID = crypto.randomUUID();

test.use({ headless: headless });

test.beforeEach(async ({ page }) => {
  await setAuth({ page });
  await setBoard({ page, boardID: BOARD_ID });
  await enterEditMode({ page });
});

test.afterEach(async ({ page }) => {
  if (await page.getByTestId("board-exit-edit-mode-button").isVisible()) {
    await exitEditMode({ page });
  }
});
  
const addTableComponent = async ({ page }) => {
  await addComponent({ page }, "table", "Large");
  await expect(page.locator(".tol-table")).toBeVisible();
};

test("manage dashboard", async ({ page }) => {
  await addTableComponent({ page });
  await deleteFirstComponent({ page, componentType: "table" });
  expect(page.locator('.tol-table')).not.toBeVisible();
});

test("shows personal table configuration notices outside edit mode", async ({ page }) => {
  await addTableComponent({ page });
  await exitEditMode({ page });

  await clickUtilityBarButton({ page, testId: "table-config-button" });

  await expect(
    page.getByText("Please be aware you are editing a version of this table for your user."),
  ).toBeVisible();
  await expect(
    page.getByText("Table configuration is saved separately for logged-in and logged-out sessions."),
  ).toBeVisible();
});
