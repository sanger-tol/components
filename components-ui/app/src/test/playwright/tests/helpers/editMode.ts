// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { Page } from "@playwright/test";

export const enterEditMode = async (page: Page) => {
  // click the enter edit mode button
  await page.getByTestId("board-enter-edit-mode-button").click();
};

export const exitEditMode = async (page: Page) => {
  // click the exit edit mode button
  await page.getByTestId("board-exit-edit-mode-button").click();
  await page.evaluate(() => window.scrollTo(0, 0));
};
