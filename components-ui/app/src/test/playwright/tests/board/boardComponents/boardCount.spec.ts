// SPDX-FileCopyrightText: 2025 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { expect, test } from '@playwright/test';
import { addComponent, setBoard, setAuth, addComponentFilter, sleep, deleteFirstComponent } from '../../helpers'

const headless = !!(process.env.CI || process.env.HEADLESS);
const BOARD_ID = crypto.randomUUID();

test.use({headless: headless});

test.beforeEach(async ({ page }) => {
  await setAuth({page});
  await setBoard({page, boardID: BOARD_ID });
});

const addCountComponent = async ({page, testID}) => {
  addComponent({page, testID}, 'statistics', 'Small');

  // check count has rendered
  await expect(page.locator('.tol-count')).toBeVisible();
}

const filterCountComponent = async ({page}) => {
  // get the count before filtering
  const countBefore = await page.locator('.tol-count').textContent();

  await addComponentFilter(
    {page},
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
  const testID = crypto.randomUUID();

  await addCountComponent({page, testID});

  await filterCountComponent({page});
  
  // await deleteCountComponent({page, testID});
  await deleteFirstComponent({ page});
  expect(page.locator('.tol-count')).not.toBeVisible();
});
