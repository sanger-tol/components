// SPDX-FileCopyrightText: 2025 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { expect, test } from "@playwright/test";
import {
  addComponent,
  setBoard,
  setAuth,
  sleep,
  configureTable,
  deleteFirstComponent,
} from "../../helpers";

const headless = !!(process.env.CI || process.env.HEADLESS);
const BOARD_ID = crypto.randomUUID();

test.use({ headless: headless });

test.beforeEach(async ({ page }) => {
  await setAuth({ page });
  await setBoard({ page, boardID: BOARD_ID });
});

const addTableComponent = async ({ page, testID }) => {
  addComponent({ page, testID }, "table", "Large");
  await sleep(200);
  await expect(page.locator(".tol-table")).toBeVisible();
  await sleep(200);
};

const checkTableTitleComponent = async ({ page , attribute}) => {
  configureTable({ page }, "table", attribute);
  await expect(page.locator(".tol-table")).toBeVisible();
  await expect(page.locator(".tol-header-text")).toContainText(attribute);
};

test("manage dashboard", async ({ page }) => {
  let testID = crypto.randomUUID();

  await addTableComponent({ page, testID });
  await checkTableTitleComponent({ page, attribute: 'Accession Data'});
  await deleteFirstComponent({ page});
  expect(page.locator('.tol-table')).not.toBeVisible();
});
