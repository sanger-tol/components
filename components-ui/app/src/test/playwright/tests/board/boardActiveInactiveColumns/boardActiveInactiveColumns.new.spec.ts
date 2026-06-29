// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { expect, Locator, Page, test } from "@playwright/test";
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
  const unsavedModal = page.getByText("Unsaved Changes").first();
  if (await unsavedModal.isVisible().catch(() => false)) {
    await page
      .locator("button")
      .filter({ hasText: /Don't Save|Discard/i })
      .first()
      .click();
  }

  const exitEditButton = page.getByTestId("board-exit-edit-mode-button");
  if (await exitEditButton.isVisible().catch(() => false)) {
    await exitEditMode(page);
  }
});

const openTableConfig = async (page: Page) => {
  await clickUtilityBarButton(page, "table-config-button", 0);
  await expect(page.locator(".rs-drawer-wrapper")).toBeVisible();
};

const saveTableConfig = async (page: Page) => {
  await page.getByTestId("save-table-button").click();
  // drawer may remain open depending on implementation; do not force-close assumption
};

const activeTab = (page: Page) => page.getByRole("tab", { name: "Active Columns", exact: true });
const inactiveTab = (page: Page) => page.getByRole("tab", { name: "Inactive Columns", exact: true });

const ensureLimitedColumnVisibilityEnabled = async (page: Page) => {
  if (await activeTab(page).isVisible().catch(() => false)) {
    return;
  }
  await page.locator(".tol-pass-through-toggle .rs-toggle").click();
  await expect(activeTab(page)).toBeVisible();
  await expect(inactiveTab(page)).toBeVisible();
};

const getFirstCombobox = (page: Page) => page.locator("[role='combobox']").first();

const openFirstComboboxAndGetFirstEnabledOption = async (page: Page) => {
  await getFirstCombobox(page).click();
  const firstEnabledOption = page.locator("[role='option']:not([aria-disabled='true'])").first();
  await expect(firstEnabledOption).toBeVisible();
  return firstEnabledOption;
};

const selectedTags = (page: Page) =>
  page.locator(".tol-selected-attributes-container [class*='tag'], .tol-selected-attributes-container .rs-tag");

const getComboboxPlaceholder = async (combobox: Locator) => {
  const fromCombobox = await combobox.getAttribute("placeholder");
  if (fromCombobox) return fromCombobox;
  return combobox.locator("input").first().getAttribute("placeholder");
};

test("board owner can enable limited column visibility", async ({ page }) => {
  await openTableConfig(page);
  await ensureLimitedColumnVisibilityEnabled(page);

  await expect(activeTab(page)).toBeVisible();
  await expect(inactiveTab(page)).toBeVisible();

  await saveTableConfig(page);
});

test("in view mode, config shows active-columns section instead of owner tabs", async ({ page }) => {
  await openTableConfig(page);
  await ensureLimitedColumnVisibilityEnabled(page);
  await saveTableConfig(page);

  await exitEditMode(page);
  await openTableConfig(page);

  await expect(page.getByRole("heading", { name: "Active Columns:" })).toBeVisible();
  await expect(activeTab(page)).toHaveCount(0);
  await expect(inactiveTab(page)).toHaveCount(0);
  await expect(getFirstCombobox(page)).toBeVisible();
});

test("board owner can add a column to active columns", async ({ page }) => {
  await openTableConfig(page);
  await ensureLimitedColumnVisibilityEnabled(page);

  await activeTab(page).click();
  const option = await openFirstComboboxAndGetFirstEnabledOption(page);
  await option.click();

  await expect(selectedTags(page).first()).toBeVisible();
  await saveTableConfig(page);
});

test("a column selected in active is unavailable in inactive selector", async ({ page }) => {
  await openTableConfig(page);
  await ensureLimitedColumnVisibilityEnabled(page);

  await activeTab(page).click();
  const option = await openFirstComboboxAndGetFirstEnabledOption(page);
  const chosenColumn = (await option.textContent())?.trim() ?? "";
  await option.click();
  await expect(chosenColumn.length).toBeGreaterThan(0);

  await inactiveTab(page).click();
  await getFirstCombobox(page).click();

  // It must not be selectable in inactive:
  const enabledSameText = page
    .locator("[role='option']:not([aria-disabled='true'])")
    .filter({ hasText: chosenColumn });
  await expect(enabledSameText).toHaveCount(0);

  // Either absent or present as disabled is acceptable:
  const disabledSameText = page
    .locator("[role='option'][aria-disabled='true']")
    .filter({ hasText: chosenColumn });
  const disabledCount = await disabledSameText.count();
  const totalSameText = await page.locator("[role='option']").filter({ hasText: chosenColumn }).count();
  expect(disabledCount === 1 || totalSameText === 0).toBeTruthy();

  await page.keyboard.press("Escape");
  await saveTableConfig(page);
});

test("board owner can remove a column from active columns", async ({ page }) => {
  await openTableConfig(page);
  await ensureLimitedColumnVisibilityEnabled(page);

  await activeTab(page).click();
  const option = await openFirstComboboxAndGetFirstEnabledOption(page);
  await option.click();

  const before = await selectedTags(page).count();
  await expect(before).toBeGreaterThan(0);

  const removeButton = page
    .locator(
      ".tol-selected-attributes-container [class*='close'], .tol-selected-attributes-container [aria-label*='remove' i], .tol-selected-attributes-container button"
    )
    .first();

  await removeButton.click();

  const after = await selectedTags(page).count();
  await expect(after).toBe(before - 1);

  await saveTableConfig(page);
});

test("active/inactive tab placeholders are correct", async ({ page }) => {
  await openTableConfig(page);
  await ensureLimitedColumnVisibilityEnabled(page);

  await activeTab(page).click();
  const activePlaceholder = await getComboboxPlaceholder(getFirstCombobox(page));
  await expect(activePlaceholder).toBe("Select columns to display...");

  await inactiveTab(page).click();
  const inactivePlaceholder = await getComboboxPlaceholder(getFirstCombobox(page));
  await expect(inactivePlaceholder).toBe("Select columns to make them visible for users...");
});

test("active column selections persist after save and reopen", async ({ page }) => {
  await openTableConfig(page);
  await ensureLimitedColumnVisibilityEnabled(page);

  await activeTab(page).click();
  const option = await openFirstComboboxAndGetFirstEnabledOption(page);
  const selectedColumnText = (await option.textContent())?.trim() ?? "";
  await option.click();

  await saveTableConfig(page);

  await openTableConfig(page);
  await ensureLimitedColumnVisibilityEnabled(page);
  await activeTab(page).click();

  await expect(page.locator(".tol-selected-attributes-container").first()).toContainText(selectedColumnText);
  await saveTableConfig(page);
});

test("board owner can navigate between active and inactive tabs", async ({ page }) => {
  await openTableConfig(page);
  await ensureLimitedColumnVisibilityEnabled(page);

  await activeTab(page).click();
  await expect(activeTab(page)).toHaveAttribute("aria-selected", "true");

  await inactiveTab(page).click();
  await expect(inactiveTab(page)).toHaveAttribute("aria-selected", "true");

  await activeTab(page).click();
  await expect(activeTab(page)).toHaveAttribute("aria-selected", "true");

  await saveTableConfig(page);
});