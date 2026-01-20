// SPDX-FileCopyrightText: 2025 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { expect, test } from "@playwright/test";
import {
  addComponent,
  setBoard,
  setAuth,
  sleep,
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
  await expect(page.locator(".tol-table")).toBeVisible();
};

const editTableComponent = async ({ page }) => {
  await sleep(1000);
  await page.getByTestId("table-slider-button").first().waitFor({ state: 'visible' });
  await page.getByTestId("table-slider-button").first().click({ force: true });
};

const selectTableContentComponent = async ({ page }) => {
  await page.getByRole('combobox').nth(1).waitFor({ state: 'visible' });
  await page.getByRole('combobox').nth(1).click({ force: true });
  await page.getByText('Accession Data').click();
  await page.getByRole('combobox').nth(1).click();
  await page.getByTestId('save-layout-button').waitFor({ state: 'visible' });
  await page.getByTestId('save-layout-button').click();
  await sleep(300);
  const tableValue = await page.locator('.tol-table').textContent();
  expect(tableValue).toBe("GCA_902713425");
};

test("manage dashboard", async ({ page }) => {
  const testID = crypto.randomUUID();

  await addTableComponent({ page, testID });
  await editTableComponent({ page });
  await selectTableContentComponent({ page });
});
