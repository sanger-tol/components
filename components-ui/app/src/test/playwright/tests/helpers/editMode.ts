// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { Page } from "@playwright/test";

/**
 * Enters Edit Mode on a board (when not already in Edit mode)
 * @param page The Playwright page handle
 */
export const enterEditMode = async (page: Page) => {
  // click the enter edit mode button
  await page.getByTestId("board-enter-edit-mode-button").click();
};

/**
 * Exits Edit Mode on a board (when already in Edit Mode)
 * @param page The Playwright page handle
 */
export const exitEditMode = async (page: Page) => {
  // click the exit edit mode button
  await page.getByTestId("board-exit-edit-mode-button").click();
  
  // This might force the view down a bit, so scroll back to the top
  await page.evaluate(() => window.scrollTo(0, 0));
};
