// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { expect, Page, test } from "@playwright/test";
import {
  addComponent,
  clickUtilityBarButton,
  createBoardId,
  enterEditMode,
  exitEditMode,
  isInHeadlessMode,
  setAuth,
  setBoard,
} from "../../helpers";

const BOARD_ID = createBoardId();

test.use({ headless: isInHeadlessMode });

test.beforeEach(async ({ page }) => {
  await setAuth(page);
  await setBoard(page, BOARD_ID);
  await enterEditMode(page);
  await addComponent(page, 0, "table", "large");
});

test.afterEach(async ({ page }) => {
  // Handle unsaved changes modal if it appears
  const unsavedModal = page.locator("text=Unsaved Changes").first();
  if (await unsavedModal.isVisible().catch(() => false)) {
    // Click "Don't Save" button (usually first action button in modal)
    await page.locator("button").filter({ hasText: /Don't Save|Discard/ }).first().click();
    await page.waitForTimeout(300);
  }

  if (await page.getByTestId("board-exit-edit-mode-button").isVisible().catch(() => false)) {
    await exitEditMode(page);
  }
});

const openTableConfig = async (page: Page) => {
  await clickUtilityBarButton(page, "table-config-button", 0);
  await page.locator(".rs-drawer-wrapper").waitFor({ state: "visible" });
};

const saveTableConfig = async (page: Page) => {
  await page.getByTestId("save-table-button").click();
};

const enableLimitedColumnVisibility = async (page: Page) => {
  await page.locator(".tol-pass-through-toggle .rs-toggle").click();
  await expect(page.getByRole("tab", { name: "Active Columns", exact: true })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Inactive Columns", exact: true })).toBeVisible();
};


test("board owner can enable limited column visibility", async ({ page }) => {
  await openTableConfig(page);
  await enableLimitedColumnVisibility(page);
  
  // Board owner sees the tabs for managing active/inactive columns
  await expect(page.getByRole("tab", { name: "Active Columns", exact: true })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Inactive Columns", exact: true })).toBeVisible();
  
  // Save to avoid unsaved changes modal on exit
  await saveTableConfig(page);
});

test("viewer sees only active columns section when limit visibility is enabled", async ({ page }) => {
  await openTableConfig(page);
  await enableLimitedColumnVisibility(page);
  await saveTableConfig(page);
  
  await exitEditMode(page);
  await openTableConfig(page);

  // Viewer sees the "Active Columns:" heading, NOT tabs
  await expect(page.getByRole("heading", { name: "Active Columns:" })).toBeVisible();
  
  // Verify NO tabs exist for viewer
  await expect(page.getByRole("tab", { name: "Inactive Columns" })).not.toBeVisible();
  
  // They can select from available columns
  await expect(page.locator("[role='combobox']").first()).toBeVisible();
});
