// SPDX-FileCopyrightText: 2025 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
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

let BOARD_ID: string;

test.use({ headless: isInHeadlessMode });

test.beforeEach(async ({ page }) => {
  BOARD_ID = createBoardId();
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
 * @param textComponent Playwright locator handle to the text component to add to
 */
const addTextToTextComponent = async (page: Page, textComponent: Locator) => {
  // get the markdown editor textarea
  const markdownEditor = textComponent.locator(".tol-markdown-viewer textarea");

  // click into the markdown editor and type text to simulate real user input
  await markdownEditor.click();
  await page.keyboard.type("Test Text", { delay: 10 });
  await sleep(1_000);
  await expect(markdownEditor).toHaveValue("Test Text");

  // click the preview button
  await clickUtilityBarButton(page, textComponent, "preview-markdown");

  // Check the text is in both of the expected places
  await expect(textComponent.locator("textarea")).toHaveText("Test Text");
  await expect(textComponent.locator("p")).toHaveText("Test Text");

  // save
  await clickUtilityBarButton(page, textComponent, "save-markdown");
};

test("manage dashboard", async ({ page }) => {
  await addComponent(page, 0, "text", "Small");
  await addTextToTextComponent(page, page.getByTestId("board-component-text"));
  await deleteComponent(page, page.getByTestId("board-component-text"), "text");
  await expect(page.locator(".tol-markdown-viewer")).not.toBeVisible();
});
