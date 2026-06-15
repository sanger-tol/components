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
const ACTIVE_COLUMN = "id";
const INACTIVE_COLUMN = "grit_project";

test.use({ headless: isInHeadlessMode });

test.beforeEach(async ({ page }) => {
  await setAuth(page);
  await setBoard(page, BOARD_ID);
  await enterEditMode(page);
  await addComponent(page, 0, "table", "large");
});

test.afterEach(async ({ page }) => {
  const drawerCloseButton = page.locator(".rs-drawer-wrapper button[aria-label='Close']").first();
  if (await drawerCloseButton.isVisible().catch(() => false)) {
    await drawerCloseButton.click();
    await page.waitForTimeout(300);
  }

  if (await page.getByTestId("board-exit-edit-mode-button").isVisible().catch(() => false)) {
    await exitEditMode(page);
  }
});

const openTableConfig = async (page: Page) => {
  await clickUtilityBarButton(page, "table-config-button", 0);
  await expect(page.locator(".rs-drawer-wrapper")).toBeVisible();
};

const saveTableConfig = async (page: Page) => {
  await page.getByTestId("save-table-button").click();
};

const enableLimitedColumnVisibility = async (page: Page) => {
  await page.locator(".tol-pass-through-toggle .rs-toggle").click();
  await expect(page.getByRole("tab", { name: "Active Columns", exact: true })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Inactive Columns", exact: true })).toBeVisible();
};

const openInactiveColumnsTab = async (page: Page) => {
  await page.getByRole("tab", { name: "Inactive Columns", exact: true }).click();
};

const openActiveColumnsTab = async (page: Page) => {
  await page.getByRole("tab", { name: "Active Columns", exact: true }).click();
};

const clickVisibleColumnPicker = async (page: Page) => {
  await page.locator("[role='combobox']:visible").nth(1).click();
};

const selectColumnInVisiblePicker = async (page: Page, attribute: string) => {
  await clickVisibleColumnPicker(page);
  await page.locator(".rs-search-box-input:visible").fill(attribute);
  await page.getByText(attribute, { exact: true }).click();
  await clickVisibleColumnPicker(page);
};

test("board owner can move a column from inactive to active", async ({ page }) => {
  await openTableConfig(page);
  await enableLimitedColumnVisibility(page);

  await openInactiveColumnsTab(page);
  await selectColumnInVisiblePicker(page, INACTIVE_COLUMN);

  await openActiveColumnsTab(page);
  await selectColumnInVisiblePicker(page, INACTIVE_COLUMN);

  await openInactiveColumnsTab(page);
  await expect(
    page.getByText("No inactive columns. Select columns to make them visible for users to add them to their tables."),
  ).toBeVisible();
});

test("viewer can add allowed inactive column to personal config", async ({ page }) => {
  await openTableConfig(page);
  await enableLimitedColumnVisibility(page);

  await selectColumnInVisiblePicker(page, ACTIVE_COLUMN);
  await openInactiveColumnsTab(page);
  await selectColumnInVisiblePicker(page, INACTIVE_COLUMN);
  await saveTableConfig(page);

  await exitEditMode(page);
  await openTableConfig(page);

  await expect(page.getByText("Limit column visibility?")).not.toBeVisible();
  await selectColumnInVisiblePicker(page, INACTIVE_COLUMN);
  await saveTableConfig(page);

  await openTableConfig(page);
  await expect(
    page.locator(".tol-config-drawer-selected-column-key:visible").filter({ hasText: INACTIVE_COLUMN }),
  ).toBeVisible();
});
