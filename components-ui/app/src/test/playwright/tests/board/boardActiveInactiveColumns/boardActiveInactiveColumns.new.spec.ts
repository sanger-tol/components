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

let BOARD_ID: string;

test.use({ headless: isInHeadlessMode });

test.beforeEach(async ({ page }) => {
  BOARD_ID = createBoardId();
  await setAuth(page);
  await setBoard(page, BOARD_ID);
  await enterEditMode(page);
  await addComponent(page, 0, "table", "large");
});

const tableDrawer = (page: Page) => page.getByTestId("drawer-wrapper").first();

const closeTableConfig = async (page: Page) => {
  const drawer = tableDrawer(page);
  if (!(await drawer.isVisible().catch(() => false))) return;

  // Prefer keyboard close for modal/drawer overlays.
  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden({ timeout: 5000 });
};

test.afterEach(async ({ page }) => {
  const pickerPopup = page.getByTestId("picker-popup").first();
  if (await pickerPopup.isVisible().catch(() => false)) {
    await page.keyboard.press("Escape").catch(() => {});
  }

  const unsavedModal = page.getByText("Unsaved Changes").first();
  if (await unsavedModal.isVisible().catch(() => false)) {
    await page
      .locator("button")
      .filter({ hasText: /Don't Save|Discard/i })
      .first()
      .click();
  }

  const drawerCloseButton = page.locator(".rs-drawer-header button").first();
  if (await drawerCloseButton.isVisible().catch(() => false)) {
    await drawerCloseButton.click();
  }

  await closeTableConfig(page); // close overlay before trying exit edit mode

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

const getActiveCombobox = (page: Page) =>
  page.locator(".tol-attribute-selector [role='combobox']").first();

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
  await expect(getActiveCombobox(page)).toBeVisible();
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

test("inactive tab shows empty-state guidance when no inactive columns are selected", async ({ page }) => {
  await openTableConfig(page);
  await ensureLimitedColumnVisibilityEnabled(page);

  await inactiveTab(page).click();
  await expect(inactiveTab(page)).toHaveAttribute("aria-selected", "true");
  await expect(
    page.getByText(
      "No inactive columns. Select columns to make them visible for users to add them to their tables."
    )
  ).toBeVisible();

  await saveTableConfig(page);
});

test("limited column visibility remains enabled after saving and reopening config", async ({ page }) => {
  await openTableConfig(page);
  await ensureLimitedColumnVisibilityEnabled(page);
  await saveTableConfig(page);

  await openTableConfig(page);
  await expect(activeTab(page)).toBeVisible();
  await expect(inactiveTab(page)).toBeVisible();
  await closeTableConfig(page); // replaces brittle .rs-drawer-header button click
});
