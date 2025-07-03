// SPDX-FileCopyrightText: 2025 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { expect, test } from '@playwright/test';
import { setAuth } from './auth.tsx';

const headless = !!(process.env.CI || process.env.HEADLESS);

test.use({headless: headless});

test.beforeEach(async ({ page }) => {
  setAuth({page});
});

const createBoard = async ({page, testID}) => {
  await page.goto('/my-boards');

  // click the create new board button
  await page.click('#create-new-board-button');

  // click the modal
  await page.getByText('Create New Board').click();

  // name the board
  await page.getByRole('textbox').fill(testID);

  // save the board
  await page.getByRole('button', {name: 'Create'}).click();
};

const deleteBoard = async({page, testID}) => {
  await page.goto('/my-boards');

  // find the correct board row
  const boardRow = await page.getByTestId(testID);

  // click the dropdown button
  await boardRow.locator(".my-boards-dropdown-buttons").click();

  // click the delete button
  await page.locator('span').filter({ hasText: /^Delete$/, visible: true, exact: true }).click();

  // click the confirm button
  await page.locator('span').filter({ hasText: /^Confirm$/, visible: true, exact: true }).click();
};

test('manage dashboard', async ({ page }) => {
  const testID = crypto.randomUUID();

  await setAuth({page});

  await createBoard({page, testID});

  await deleteBoard({page, testID});
});
