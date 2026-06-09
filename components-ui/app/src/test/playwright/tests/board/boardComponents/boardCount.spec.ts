// SPDX-FileCopyrightText: 2025 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { expect, test } from "@playwright/test";
import {
  addComponent,
  setBoard,
  setAuth,
  addComponentFilter,
  sleep,
  deleteComponent,
  enterEditMode,
  exitEditMode,
  createBoardId
} from "../../helpers";

const headless = !!(process.env.CI || process.env.HEADLESS);
const BOARD_ID = createBoardId();

test.use({ headless: headless });

test.beforeEach(async ({ page }) => {
  await setAuth(page);
  await setBoard({ page, boardID: BOARD_ID });
  await enterEditMode(page);
});

test.afterEach(async ({ page }) => {
  await exitEditMode(page);
});

const filterCountComponent = async (page) => {
  // get the count before filtering
  const countBefore = await page.locator(".tol-count").textContent();

  await addComponentFilter(
    page,
    "statistics",
    0,
    "grit_project",
    "in_list",
    "ToL Rapid Curation"
  );

  // check the count has changed
  // TODO This sleep should be removed at some point
  await sleep(200);
  const countAfter = await page.locator(".tol-count").textContent();
  expect(countAfter).not.toBe(countBefore);
}

test("manage dashboard", async ({ page }) => {
  await addComponent(page, 0, "statistics", "Small");

  await filterCountComponent(page);

  await deleteComponent(page, "statistics", 0);
  await expect(page.locator(".tol-count")).not.toBeVisible();
});
