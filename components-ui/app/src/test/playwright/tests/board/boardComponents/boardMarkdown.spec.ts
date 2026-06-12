// SPDX-FileCopyrightText: 2025 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { expect, Page, test } from "@playwright/test";
import {
  addComponent,
  setBoard,
  setAuth,
  deleteComponent,
  clickUtilityBarButton,
  sleep,
  enterEditMode,
  exitEditMode,
  createBoardId,
  isInHeadlessMode
} from "../../helpers";

const BOARD_ID = createBoardId();

test.use({ headless: isInHeadlessMode });

test.beforeEach(async ({ page }) => {
  await setAuth(page);
  await setBoard(page, BOARD_ID);
  await enterEditMode(page);
});

test.afterEach(async ({ page }) => {
  await exitEditMode(page);
});

/**
 * Adds text to an empty Text component
 * @param page The Playwright page handle
 * @param componentIndex Out of all the Text components on the screen, which is it? Zero-indexed
 */
const addTextToMarkdownComponent = async (page: Page, componentIndex: number) => {
  // get the markdown editor textarea
  const markdownEditor = page.locator(".tol-markdown-viewer textarea");

  // click into the markdown editor and type text to simulate real user input
  await markdownEditor.click();
  await page.keyboard.type("Test Text", { delay: 10 });
  await sleep(1000);
  await expect(markdownEditor).toHaveValue("Test Text");

  // click the preview button
  await clickUtilityBarButton(page, "preview-markdown", componentIndex);

  // Check the text is in both of the expected places
  await expect(page.locator("[data-testid=\"board-component-text\"] textarea")).toHaveText("Test Text");
  await expect(page.locator("[data-testid=\"board-component-text\"] p")).toHaveText("Test Text");
};

const saveMarkDownComponent = async ({ page }) => {
  await clickUtilityBarButton(page, "save-markdown", 0);
}

test("manage dashboard", async ({ page }) => {
  await addComponent(page, 0, "text", "Small");
  await addTextToMarkdownComponent(page, 0);
  await saveMarkDownComponent({ page });
  await deleteComponent(page, "text", 0);
  await expect(page.locator(".tol-markdown-viewer")).not.toBeVisible();
});
