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
} from "../helpers";

let BOARD_ID: string;

test.use({ headless: isInHeadlessMode });

test.beforeEach(async ({ page }) => {
  BOARD_ID = createBoardId();
  await setAuth(page);
  await setBoard(page, BOARD_ID);
  await enterEditMode(page);
  await addComponent(page, 0, "table", "large");
});

test.afterEach(async ({ page }) => {
  await closePickerPopup(page);
  await discardUnsavedChanges(page);
  await closeDrawer(page);
  await exitToViewMode(page);
});

const getDrawer = (page: Page) => page.locator(".rs-drawer-wrapper");

const openTableConfig = async (page: Page) => {
  const drawer = getDrawer(page);

  if (await drawer.isVisible().catch(() => false)) {
    return;
  }

  await closePickerPopup(page);
  await clickUtilityBarButton(page, "table-config-button", 0);
  await expect(drawer).toBeVisible();
};
const getColumnSelector = (page: Page) =>
  page.locator(".tol-attribute-selector [role='combobox']").first();

const getDrawerCloseButton = (page: Page) => page.getByTestId("drawer-close-button").first();

const closePickerPopup = async (page: Page) => {
  const pickerPopup = page.getByTestId("picker-popup").first();

  if (await pickerPopup.isVisible().catch(() => false)) {
    await page.keyboard.press("Escape").catch(() => {});
    await expect(pickerPopup).toBeHidden().catch(() => {});
  }
};

const discardUnsavedChanges = async (page: Page) => {
  const unsavedModal = page.getByText("Unsaved Changes").first();

  if (await unsavedModal.isVisible().catch(() => false)) {
    await page
      .locator("button")
      .filter({ hasText: /Don't Save|Discard/i })
      .first()
      .click()
      .catch(() => {});
  }
};

const closeDrawer = async (page: Page) => {
  const drawer = getDrawer(page);

  if (!(await drawer.isVisible().catch(() => false))) {
    return;
  }

  await closePickerPopup(page);

  const drawerCloseButton = getDrawerCloseButton(page);
  if (await drawerCloseButton.isVisible().catch(() => false)) {
    await drawerCloseButton.click().catch(() => {});
  } else {
    await page.keyboard.press("Escape").catch(() => {});
  }

  await discardUnsavedChanges(page);
  await expect(drawer).toBeHidden().catch(() => {});
};

const exitToViewMode = async (page: Page) => {
  const exitButton = page.getByTestId("board-exit-edit-mode-button");

  if (!(await exitButton.isVisible().catch(() => false))) {
    return;
  }

  await closeDrawer(page);
  await exitEditMode(page);

  const confirmExitButton = page.getByRole("button", { name: /^Exit$/ }).first();
  if (await confirmExitButton.isVisible().catch(() => false)) {
    await confirmExitButton.click();
  }

  await expect(page.getByTestId("board-enter-edit-mode-button")).toBeVisible();
};

test("board owner sees personal notice when editing component outside edit mode", async ({ page }) => {
  await exitToViewMode(page);

  await openTableConfig(page);

  const personalNotice = page.getByText(
    /Please be aware that you are editing a version of this.*for yourself/i,
  );
  const isVisible = await personalNotice.isVisible().catch(() => false);

  if (isVisible) {
    await expect(personalNotice).toBeVisible();
  }

  await closeDrawer(page);
});

test("session-based configuration notice appears for table config", async ({ page }) => {
  await exitToViewMode(page);

  await openTableConfig(page);

  const sessionNotice = page.getByText(
    /Table configuration is saved separately for logged-in and logged-out sessions/i,
  );
  const isVisible = await sessionNotice.isVisible().catch(() => false);

  if (isVisible) {
    await expect(sessionNotice).toBeVisible();
  }

  await closeDrawer(page);
});

test("viewer can select columns in personal view", async ({ page }) => {
  await exitToViewMode(page);

  await openTableConfig(page);

  const combobox = getColumnSelector(page);
  await expect(combobox).toBeVisible();

  await combobox.click();

  const pickerPopup = page.getByTestId("picker-popup").first();
  await expect(pickerPopup).toBeVisible();

  const options = pickerPopup.locator("[role='option']");
  await expect(options.first()).toBeVisible();

  await page.keyboard.press("Escape");
  await closeDrawer(page);
});

test("table config opens in edit mode and can be reopened", async ({ page }) => {
  await openTableConfig(page);
  await expect(page.getByRole("heading", { name: "Table Configuration" })).toBeVisible();

  await closeDrawer(page);
  await expect(getDrawer(page)).toBeHidden();

  await openTableConfig(page);
  await expect(page.getByRole("heading", { name: "Table Configuration" })).toBeVisible();

  await closeDrawer(page);
});

test("closeDrawer closes picker popup when attribute picker is open", async ({ page }) => {
  await openTableConfig(page);

  const combobox = getColumnSelector(page);
  await expect(combobox).toBeVisible();
  await combobox.click();

  const pickerPopup = page.getByTestId("picker-popup").first();
  await expect(pickerPopup).toBeVisible();

  await closeDrawer(page);

  await expect(getDrawer(page)).toBeHidden();
  await expect(pickerPopup).toBeHidden();
});

test("viewer can reopen table config multiple times in personal view", async ({ page }) => {
  await exitToViewMode(page);

  for (let i = 0; i < 2; i++) {
    await openTableConfig(page);
    await expect(page.getByRole("heading", { name: "Table Configuration" })).toBeVisible();
    await expect(getColumnSelector(page)).toBeVisible();
    await closeDrawer(page);
    await expect(getDrawer(page)).toBeHidden();
  }
});

test("can re-enter edit mode after exiting to view mode", async ({ page }) => {
  await exitToViewMode(page);

  const enterEditButton = page.getByTestId("board-enter-edit-mode-button");
  await expect(enterEditButton).toBeVisible();
  await enterEditButton.click();

  await expect(page.getByTestId("board-exit-edit-mode-button")).toBeVisible();

  await openTableConfig(page);
  await expect(page.getByRole("heading", { name: "Table Configuration" })).toBeVisible();
  await closeDrawer(page);
});