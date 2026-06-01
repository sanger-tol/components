// SPDX-FileCopyrightText: 2025 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { expect, test } from '@playwright/test';
import {
  addComponent,
  setBoard,
  setAuth,
  addComponentFilter,
  sleep,
  deleteFirstComponent,
  enterEditMode,
  exitEditMode
} from '../../helpers'

const headless = !!(process.env.CI || process.env.HEADLESS);
const BOARD_ID = `b_${crypto.randomUUID()}`;

test.use({ headless: headless });

test.beforeEach(async ({ page }) => {
  await setAuth({ page });
  await setBoard({ page, boardID: BOARD_ID });
  await enterEditMode( page );
});

test.afterEach(async ({ page }) => {
  await exitEditMode( page );
});

const addCountComponent = async ({ page }) => {
  await addComponent({ page }, 'statistics', 'Small');
  await expect(page.locator('.tol-count')).toBeVisible();
}

const filterCountComponent = async ({ page }) => {
  // get the count before filtering
  const countBefore = await page.locator('.tol-count').textContent();

  await addComponentFilter(
    { page },
    'statistics',
    'grit_project',
    'ToL Rapid Curation',
    'multiselect'
  );

  // check the count has changed
  // This sleep should be removed at some point
  await sleep(200);
  const countAfter = await page.locator('.tol-count').textContent();
  expect(countAfter).not.toBe(countBefore);
}

test('manage dashboard', async ({ page }) => {
  await addCountComponent({ page });

  await filterCountComponent({ page });

  // await deleteCountComponent({page, testID});
  await deleteFirstComponent({ page, componentType: "statistics" });
  await expect(page.locator('.tol-count')).not.toBeVisible();
});
