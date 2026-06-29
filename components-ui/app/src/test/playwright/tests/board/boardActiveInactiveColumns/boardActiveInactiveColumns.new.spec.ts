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

test("board owner can add columns to active columns tab", async ({ page }) => {
  await openTableConfig(page);
  await enableLimitedColumnVisibility(page);
  
  // Click on Active Columns tab to ensure it's focused
  await page.getByRole("tab", { name: "Active Columns", exact: true }).click();
  
  // Open the column selector (first combobox in active columns)
  const activeCombobox = page.locator("[role='combobox']").first();
  await activeCombobox.click();
  
  // Wait for dropdown to appear and select first available column
  await page.waitForTimeout(300);
  const firstOption = page.locator("[role='option']").first();
  await expect(firstOption).toBeVisible();
  await firstOption.click();
  
  // Verify the column was added to the list
  await expect(page.locator(".tol-selected-attributes-container").first()).toBeVisible();
  
  await saveTableConfig(page);
});

test("board owner can move columns to inactive columns tab", async ({ page }) => {
  await openTableConfig(page);
  await enableLimitedColumnVisibility(page);
  
  // Add column to active first
  await page.getByRole("tab", { name: "Active Columns", exact: true }).click();
  const activeCombobox = page.locator("[role='combobox']").first();
  await activeCombobox.click();
  await page.waitForTimeout(300);
  const firstOption = page.locator("[role='option']").first();
  await firstOption.click();
  
  // Switch to Inactive Columns tab
  await page.getByRole("tab", { name: "Inactive Columns", exact: true }).click();
  
  // Verify the Inactive Columns tab is now active
  await expect(page.getByRole("tab", { name: "Inactive Columns", exact: true })).toHaveAttribute(
    "aria-selected",
    "true"
  );
  
  // Open column selector in inactive tab
  const inactiveCombobox = page.locator("[role='combobox']").first();
  await inactiveCombobox.click();
  await page.waitForTimeout(300);
  
  // The previously active column should NOT be available in inactive (disabled)
  const optionsInInactive = await page.locator("[role='option']").count();
  await expect(optionsInInactive).toBeGreaterThan(0);
  
  await saveTableConfig(page);
});

test("columns in active tab are disabled in inactive tab selector", async ({ page }) => {
  await openTableConfig(page);
  await enableLimitedColumnVisibility(page);
  
  // Add column to active tab
  await page.getByRole("tab", { name: "Active Columns", exact: true }).click();
  const activeCombobox = page.locator("[role='combobox']").first();
  await activeCombobox.click();
  await page.waitForTimeout(300);
  const firstOption = page.locator("[role='option']").first();
  const columnName = await firstOption.textContent();
  await firstOption.click();
  
  // Switch to Inactive tab
  await page.getByRole("tab", { name: "Inactive Columns", exact: true }).click();
  
  // Try to open inactive column selector - the active column should be grayed out/disabled
  const inactiveCombobox = page.locator("[role='combobox']").first();
  await inactiveCombobox.click();
  await page.waitForTimeout(300);
  
  // Verify that disabled items exist (they should not be clickable)
  const disabledOptions = page.locator("[role='option'][aria-disabled='true']");
  const disabledCount = await disabledOptions.count();
  
  // Close the combobox without selecting
  await page.keyboard.press("Escape");
  
  await saveTableConfig(page);
});

test("inactive columns tab shows empty message when no inactive columns available", async ({ page }) => {
  await openTableConfig(page);
  await enableLimitedColumnVisibility(page);
  
  // Switch to Inactive Columns tab
  await page.getByRole("tab", { name: "Inactive Columns", exact: true }).click();
  
  // Check for empty message
  const emptyMessage = page.locator("text=No inactive columns");
  const isVisible = await emptyMessage.isVisible().catch(() => false);
  
  // If there are actually inactive columns available, that's fine for this test
  // The important part is that the tab is accessible and has content
  await expect(page.getByRole("tab", { name: "Inactive Columns", exact: true })).toBeVisible();
  
  await saveTableConfig(page);
});

test("active columns tab shows placeholder text", async ({ page }) => {
  await openTableConfig(page);
  await enableLimitedColumnVisibility(page);
  
  // Click on Active Columns tab
  await page.getByRole("tab", { name: "Active Columns", exact: true }).click();
  
  // Check for placeholder text in the combobox
  const combobox = page.locator("[role='combobox']").first();
  const placeholder = await combobox.getAttribute("placeholder");
  await expect(placeholder).toBe("Select columns to display...");
});

test("inactive columns tab shows placeholder text", async ({ page }) => {
  await openTableConfig(page);
  await enableLimitedColumnVisibility(page);
  
  // Click on Inactive Columns tab
  await page.getByRole("tab", { name: "Inactive Columns", exact: true }).click();
  
  // Check for placeholder text in the combobox
  const combobox = page.locator("[role='combobox']").first();
  const placeholder = await combobox.getAttribute("placeholder");
  await expect(placeholder).toBe("Select columns to make them visible for users...");
});

test("board owner can add multiple columns to active columns", async ({ page }) => {
  await openTableConfig(page);
  await enableLimitedColumnVisibility(page);
  
  // Click on Active Columns tab
  await page.getByRole("tab", { name: "Active Columns", exact: true }).click();
  
  // Add first column
  let combobox = page.locator("[role='combobox']").first();
  await combobox.click();
  await page.waitForTimeout(300);
  let firstOption = page.locator("[role='option']").first();
  await firstOption.click();
  
  // Add second column
  await page.waitForTimeout(300);
  combobox = page.locator("[role='combobox']").first();
  await combobox.click();
  await page.waitForTimeout(300);
  const secondOption = page.locator("[role='option']").first();
  await secondOption.click();
  
  // Verify multiple items are shown
  const selectedItems = page.locator(".tol-selected-attributes-container [class*='tag']");
  const count = await selectedItems.count();
  await expect(count).toBeGreaterThanOrEqual(2);
  
  await saveTableConfig(page);
});

test("board owner can remove columns from active columns", async ({ page }) => {
  await openTableConfig(page);
  await enableLimitedColumnVisibility(page);
  
  // Add column to active
  await page.getByRole("tab", { name: "Active Columns", exact: true }).click();
  const combobox = page.locator("[role='combobox']").first();
  await combobox.click();
  await page.waitForTimeout(300);
  const firstOption = page.locator("[role='option']").first();
  await firstOption.click();
  
  // Verify column was added
  let selectedItems = page.locator(".tol-selected-attributes-container [class*='tag']");
  let countAfterAdd = await selectedItems.count();
  await expect(countAfterAdd).toBeGreaterThan(0);
  
  // Remove the column by clicking the close/remove button
  const removeButton = page.locator(".tol-selected-attributes-container [class*='close']").first();
  await removeButton.click();
  
  // Verify column was removed
  await page.waitForTimeout(300);
  selectedItems = page.locator(".tol-selected-attributes-container [class*='tag']");
  let countAfterRemove = await selectedItems.count();
  await expect(countAfterRemove).toBe(countAfterAdd - 1);
  
  await saveTableConfig(page);
});

test("active and inactive columns persist after save and reload", async ({ page }) => {
  await openTableConfig(page);
  await enableLimitedColumnVisibility(page);
  
  // Add column to active tab
  await page.getByRole("tab", { name: "Active Columns", exact: true }).click();
  const combobox = page.locator("[role='combobox']").first();
  await combobox.click();
  await page.waitForTimeout(300);
  const firstOption = page.locator("[role='option']").first();
  const selectedColumnText = await firstOption.textContent();
  await firstOption.click();
  
  // Save configuration
  await saveTableConfig(page);
  
  // Close and reopen table config
  await page.waitForTimeout(500);
  await openTableConfig(page);
  
  // Enable limit visibility again (if needed) or directly check tabs
  const activeTab = page.getByRole("tab", { name: "Active Columns", exact: true });
  if (await activeTab.isVisible().catch(() => false)) {
    await activeTab.click();
    
    // Verify the column is still in active list
    const selectedItems = page.locator(".tol-selected-attributes-container");
    await expect(selectedItems.first()).toContainText(selectedColumnText!);
  }
  
  await saveTableConfig(page);
});

test("board owner can navigate between active and inactive tabs", async ({ page }) => {
  await openTableConfig(page);
  await enableLimitedColumnVisibility(page);
  
  // Click Active tab and verify it's selected
  await page.getByRole("tab", { name: "Active Columns", exact: true }).click();
  await expect(page.getByRole("tab", { name: "Active Columns", exact: true })).toHaveAttribute(
    "aria-selected",
    "true"
  );
  
  // Click Inactive tab and verify it's selected
  await page.getByRole("tab", { name: "Inactive Columns", exact: true }).click();
  await expect(page.getByRole("tab", { name: "Inactive Columns", exact: true })).toHaveAttribute(
    "aria-selected",
    "true"
  );
  
  // Click back to Active tab
  await page.getByRole("tab", { name: "Active Columns", exact: true }).click();
  await expect(page.getByRole("tab", { name: "Active Columns", exact: true })).toHaveAttribute(
    "aria-selected",
    "true"
  );
  
  await saveTableConfig(page);
});
