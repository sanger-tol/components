// SPDX-FileCopyrightText: 2025 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { expect, test } from '@playwright/test';
import { addComponent, setupBoard, deleteBoard, setAuth, addComponentFilter, sleep } from '../helpers'
import { setBoard } from '../helpers/boardShortcut';

const headless = !!(process.env.CI || process.env.HEADLESS);

test.use({headless: headless});

test.beforeEach(async ({ page }) => {
  await setAuth({page});
  await setBoard({page});
});

const addCountComponent = async ({page, testID}) => {
  addComponent({page, testID}, 'count', 'Small');

  // check count has rendered
  await sleep(200);
  await expect(page.locator('.tol-count')).toBeVisible();
}

const filterCountComponent = async ({page, testID}) => {
  // get the count before filtering
  await sleep(200);
  const countBefore = await page.locator('.tol-count').textContent();

  await addComponentFilter(
    {page, testID},
    'count',
    'grit_project',
    'ToL Rapid Curation',
    'multiselect'
  );

  // check the count has changed
  await sleep(200);
  const countAfter = await page.locator('.tol-count').textContent();
  expect(countAfter).not.toBe(countBefore);
}

const deleteCountComponent = async ({page, testID}) => {
  // click show edit buttons button
  await page.getByTestId('edit-zone-button').first().click();

  // click the edit/move components button
  await page.getByTestId('drag-components-button').first().click();

  // click the delete button
  await page.getByTestId('delete-component-button').first().click();

  // confirm the delete
  await page.getByTestId('confirm-delete-button').click();

  // click the save button
  await page.getByTestId('save-layout-button').click();

  // check the count component has been deleted
  expect(page.locator('.tol-count')).not.toBeVisible();
};

test('manage dashboard', async ({ page }) => {
  const testID = crypto.randomUUID();

  await setupBoard({page, testID});

  await addCountComponent({page, testID});

  await filterCountComponent({page, testID});
  
  await deleteCountComponent({page, testID});

  await deleteBoard({page, testID});
});
