// SPDX-FileCopyrightText: 2025 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { expect, Page, test } from "@playwright/test";
import {
  addComponent,
  createPopulatedBoardAndGoToPage,
  setAuth,
  addComponentFilter,
  deleteComponent,
  enterEditMode,
  exitEditMode,
  isInHeadlessMode
} from "../../helpers";

test.use({ headless: isInHeadlessMode });

test.beforeEach(async ({ page }) => {
  await setAuth(page);
  await createPopulatedBoardAndGoToPage(page);
  await enterEditMode(page);
});

test.afterEach(async ({ page }) => {
  await exitEditMode(page);
});

const filterStatisticsComponent = async (page: Page) => {
  // get the count before filtering
  const countBefore = await page.locator(".tol-count").textContent();

  await addComponentFilter(
    page,
    page.getByTestId("board-component-statistics"),
    "statistics",
    "grit_project",
    "in_list",
    "ToL Rapid Curation"
  );

  // check the count has changed
  // TODO This sleep should be removed at some point
  await page.waitForTimeout(200);
  const countAfter = await page.locator(".tol-count").textContent();
  expect(countAfter).not.toBe(countBefore);
}

test("manage dashboard", async ({ page }) => {
  await addComponent(page, page.getByTestId("zone").first(), "statistics", "Small");

  await filterStatisticsComponent(page);

  await deleteComponent(page, page.getByTestId("board-component-statistics"), "statistics");
  await expect(page.locator(".tol-count")).not.toBeVisible();
});
