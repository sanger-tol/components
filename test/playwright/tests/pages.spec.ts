// SPDX-FileCopyrightText: 2025 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { expect, test } from '@playwright/test';
import { setAuth } from './auth.tsx';

const headless = !!(process.env.CI || process.env.HEADLESS);

test.use({headless: headless});

test.beforeEach(async ({ page }) => {
  await setAuth({page});
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

const createView = async ({page, testID}) => {};

const createZone = async ({page, testID}) => {
  // click add zone button
  await page.click('.add-zone-button');

  // choose the object type
  await page.getByRole('combobox').click();

  // select the object type
  await page.getByText('curation').click();

  // name the zone
  await page.getByRole('textbox').fill(testID);

  // click add zone button
  await page.getByRole('button', {name: 'Add Zone'}).click();
};

const addCountComponent = async ({page, testID}) => {
  // click the add component button
  await page.getByTestId('add-component-button').first().click();

  // select the component type
  await page.getByTestId(`component-option-count`).click();

  // select size
  await page.getByText('Small').click();

  // enter the title
  await page.getByRole('textbox').fill(testID);

  // click the add component button
  await page.getByTestId('confirm-add-component-button').click();
}

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

  await createBoard({page, testID});

  await createView({page, testID});

  await createZone({page, testID});

  await addCountComponent({page, testID});

  await deleteBoard({page, testID});
});
