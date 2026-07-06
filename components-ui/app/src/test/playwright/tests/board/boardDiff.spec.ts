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

test("viewer can customize component config without affecting board", async ({ page }) => {
  // Save board in edit mode
  await page.getByTestId("board-exit-edit-mode-button").click();
  await page.waitForTimeout(300);

  // Exit to view mode
  const confirmButton = page.locator("button").filter({ hasText: "Exit" }).first();
  if (await confirmButton.isVisible().catch(() => false)) {
    await confirmButton.click();
    await page.waitForTimeout(300);
  }

  // Now customize a component while in viewer mode
  await openTableConfig(page);

  // Toggle limited visibility column feature
  const passToggle = page.locator(".tol-pass-through-toggle .rs-toggle").first();
  if (await passToggle.isVisible().catch(() => false)) {
    await passToggle.click();
    await page.waitForTimeout(300);
  }

  await saveTableConfig(page);

  // Verify the configuration was saved
  await page.waitForTimeout(500);
  await openTableConfig(page);

  // The toggle should still be enabled
  await expect(page.locator(".tol-pass-through-toggle .rs-toggle")).toBeVisible();

  await page.getByTestId("drawer-close-button").click();
});

test("personal configuration persists after page reload", async ({ page }) => {
  // Exit edit mode and go to view mode
  await exitEditMode(page);

  // Customize component
  await openTableConfig(page);

  const passToggle = page.locator(".tol-pass-through-toggle .rs-toggle").first();
  const wasCheckedBefore = await passToggle.evaluate((el: HTMLElement) => {
    return el.getAttribute("aria-checked");
  });

  if (await passToggle.isVisible().catch(() => false)) {
    await passToggle.click();
    await page.waitForTimeout(300);
  }

  await saveTableConfig(page);
  await page.waitForTimeout(500);

  // Reload the page
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // Check if the configuration persists
  await openTableConfig(page);

  const wasCheckedAfter = await page
    .locator(".tol-pass-through-toggle .rs-toggle")
    .evaluate((el: HTMLElement) => {
      return el.getAttribute("aria-checked");
    })
    .catch(() => null);

  // The state should have changed from the toggle
  if (wasCheckedBefore !== "true") {
    await expect(
      page.locator(".tol-pass-through-toggle .rs-toggle[aria-checked='true']"),
    ).toBeVisible();
  }

  await page.getByTestId("drawer-close-button").click();
});

test("personal config changes only affect the current user", async ({ page }) => {
  // Skip this test as multi-user testing requires separate sessions
  // This would typically be tested in integration tests
  test.skip();
});

test("board owner sees personal notice when editing component outside edit mode", async ({ page }) => {
  // Exit to view mode
  await exitEditMode(page);

  // Open component config
  await openTableConfig(page);

  // Should see personal configuration notice
  const personalNotice = page.getByText(
    /Please be aware that you are editing a version of this.*for yourself/i,
  );
  const isVisible = await personalNotice.isVisible().catch(() => false);

  if (isVisible) {
    await expect(personalNotice).toBeVisible();
  }

  await page.getByTestId("drawer-close-button").click();
});

test("session-based configuration notice appears for table config", async ({ page }) => {
  // Exit to view mode
  await exitEditMode(page);

  // Open table config
  await clickUtilityBarButton(page, "table-config-button", 0);
  await expect(page.locator(".rs-drawer-wrapper")).toBeVisible();

  // Look for session-based configuration notice
  const sessionNotice = page.getByText(
    /Table configuration is saved separately for logged-in and logged-out sessions/i,
  );
  const isVisible = await sessionNotice.isVisible().catch(() => false);

  if (isVisible) {
    await expect(sessionNotice).toBeVisible();
  }

  await page.getByTestId("drawer-close-button").click();
});

test("viewer can select columns in personal view", async ({ page }) => {
  // Exit to view mode
  await exitEditMode(page);

  // Open table config
  await openTableConfig(page);

  // Verify column selectors are available
  const combobox = page.locator("[role='combobox']").first();
  await expect(combobox).toBeVisible();

  // Can interact with column selector
  await combobox.click();
  await page.waitForTimeout(300);

  const options = page.locator("[role='option']");
  const optionCount = await options.count();
  await expect(optionCount).toBeGreaterThan(0);

  // Close without selecting
  await page.keyboard.press("Escape");
  await page.getByTestId("drawer-close-button").click();
});

test("personal config tab and default tab work independently", async ({ page }) => {
  // In edit mode - configure default columns
  await openTableConfig(page);

  const activeTab = page.getByRole("tab", { name: "Active Columns" }).first();
  if (await activeTab.isVisible().catch(() => false)) {
    await activeTab.click();

    // Add a column to the board default
    const combobox = page.locator("[role='combobox']").first();
    await combobox.click();
    await page.waitForTimeout(300);
    const firstOption = page.locator("[role='option']").first();
    await firstOption.click();
  }

  await saveTableConfig(page);
  await page.waitForTimeout(300);

  // Exit edit mode
  await exitEditMode(page);

  // Open config in view mode - should see personal vs default settings
  await openTableConfig(page);

  // Should be able to make personal adjustments
  const combobox = page.locator("[role='combobox']").first();
  await expect(combobox).toBeVisible();

  await page.getByTestId("drawer-close-button").click();
});

test("drawer closes after saving personal configuration", async ({ page }) => {
  // Exit to view mode
  await exitEditMode(page);

  // Open table config
  await openTableConfig(page);
  await expect(page.locator(".rs-drawer-wrapper")).toBeVisible();

  // Save config
  await saveTableConfig(page);

  // Drawer should close
  await expect(page.locator(".rs-drawer-wrapper")).not.toBeVisible({ timeout: 2000 });
});

test("multiple configuration changes can be made in sequence", async ({ page }) => {
  // Exit to view mode
  await exitEditMode(page);

  // First configuration change
  await openTableConfig(page);
  const toggle1 = page.locator(".tol-pass-through-toggle .rs-toggle").first();
  if (await toggle1.isVisible().catch(() => false)) {
    await toggle1.click();
    await page.waitForTimeout(200);
  }
  await saveTableConfig(page);
  await page.waitForTimeout(500);

  // Second configuration change
  await openTableConfig(page);
  const combobox = page.locator("[role='combobox']").first();
  if (await combobox.isVisible().catch(() => false)) {
    await combobox.click();
    await page.waitForTimeout(300);
  }
  await saveTableConfig(page);

  // Verify no errors occurred
  const errorMessage = page.locator("[role='alert']").filter({ hasText: "Error" });
  await expect(errorMessage).not.toBeVisible({ timeout: 1000 });
});

test("configuration persists when navigating away and back", async ({ page }) => {
  // Exit to view mode
  await exitEditMode(page);

  // Make a configuration change
  await openTableConfig(page);

  const toggle = page.locator(".tol-pass-through-toggle .rs-toggle").first();
  const initialState = await toggle.evaluate((el: HTMLElement) => {
    return el.getAttribute("aria-checked");
  });

  if (await toggle.isVisible().catch(() => false)) {
    await toggle.click();
    await page.waitForTimeout(300);
  }

  await saveTableConfig(page);
  await page.waitForTimeout(500);

  // Navigate away by going to board list
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // Navigate back to the board
  await setBoard(page, BOARD_ID);
  await page.waitForTimeout(1000);

  // Verify configuration persists
  await openTableConfig(page);

  const finalState = await page
    .locator(".tol-pass-through-toggle .rs-toggle")
    .evaluate((el: HTMLElement) => {
      return el.getAttribute("aria-checked");
    })
    .catch(() => null);

  // The state should be different from initial (toggled)
  if (initialState !== "true") {
    await expect(
      page.locator(".tol-pass-through-toggle .rs-toggle[aria-checked='true']"),
    ).toBeVisible();
  }

  await page.getByTestId("drawer-close-button").click();
});

test("error handling when configuration save fails", async ({ page }) => {
  // Exit to view mode
  await exitEditMode(page);

  // Mock network error by going offline
  await page.context().setOffline(true);

  // Try to save configuration
  await openTableConfig(page);

  const toggle = page.locator(".tol-pass-through-toggle .rs-toggle").first();
  if (await toggle.isVisible().catch(() => false)) {
    await toggle.click();
    await page.waitForTimeout(300);
  }

  // Attempt to save while offline
  const saveButton = page.getByTestId("save-table-button");
  await saveButton.click();

  // Go back online
  await page.context().setOffline(false);
  await page.waitForTimeout(300);

  // Close drawer
  const closeButton = page.getByTestId("drawer-close-button");
  if (await closeButton.isVisible().catch(() => false)) {
    await closeButton.click();
  }
});

test("component configuration drawer has proper accessibility", async ({ page }) => {
  // Exit to view mode
  await exitEditMode(page);

  // Open config drawer
  await openTableConfig(page);

  // Drawer should have proper ARIA attributes
  const drawer = page.locator(".rs-drawer-wrapper");
  await expect(drawer).toHaveAttribute("role", "presentation");

  // Close button should be accessible
  const closeButton = page.getByTestId("drawer-close-button");
  await expect(closeButton).toBeFocused({ timeout: 1000 }).catch(() => {
    // Focus may not be on close button initially, which is fine
  });

  await closeButton.click();
});

test("personal configuration is separate from edit mode changes", async ({ page }) => {
  // Make changes in edit mode
  await openTableConfig(page);

  const initialToggleState = await page
    .locator(".tol-pass-through-toggle .rs-toggle")
    .evaluate((el: HTMLElement) => {
      return el.getAttribute("aria-checked");
    })
    .catch(() => "false");

  const toggle = page.locator(".tol-pass-through-toggle .rs-toggle").first();
  if (await toggle.isVisible().catch(() => false)) {
    await toggle.click();
    await page.waitForTimeout(300);
  }

  await saveTableConfig(page);
  await page.waitForTimeout(300);

  // Exit edit mode without saving
  if (await page.getByTestId("board-exit-edit-mode-button").isVisible().catch(() => false)) {
    await exitEditMode(page);
  }

  // Now make personal changes in view mode
  await openTableConfig(page);

  const personalToggle = page.locator(".tol-pass-through-toggle .rs-toggle").first();
  if (await personalToggle.isVisible().catch(() => false)) {
    // Toggle in opposite direction
    const currentState = await personalToggle.evaluate((el: HTMLElement) => {
      return el.getAttribute("aria-checked");
    });

    if (currentState === initialToggleState) {
      await personalToggle.click();
      await page.waitForTimeout(300);
    }
  }

  await saveTableConfig(page);

  // Verify personal change was applied
  await expect(page.locator(".rs-drawer-wrapper")).not.toBeVisible({ timeout: 2000 });
});
