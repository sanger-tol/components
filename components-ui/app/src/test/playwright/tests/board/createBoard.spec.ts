// SPDX-FileCopyrightText: 2025 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { test } from '@playwright/test';
import { enterEditMode, exitEditMode, setAuth } from '../helpers';

const headless = !!(process.env.CI || process.env.HEADLESS);

test.use({ headless: headless });

test.beforeEach(async ({ page }) => {
  await setAuth({ page });
});

const createBoard = async ({ page, testID }) => {
  await page.goto('/my-boards');

  // click the create new board button
  await page.click('#create-new-board-button');

  // click the modal
  await page.getByText('Create New Board').click();

  // name the board
  await page.getByRole('textbox').fill(testID);

  // save the board
  await page.getByRole('button', { name: 'Create' }).click();
};

const createZone = async ({ page, testID }) => {
  // enter edit mode
  await enterEditMode({ page });

  // click add zone button
  const addZoneButton = await page.getByTestId('open-add-zone-modal-button');
  await addZoneButton.click();

  // choose the dataspace picker
  await page.getByTestId('dataspace-picker').click();

  // select the dataspace
  await page.locator('[data-key="tol_production"]').click();

  // choose the object type picker
  await page.getByTestId('object-type-picker').click();

  // select the object type
  await page.getByText('Curation').click();

  // name the zone
  await page.getByRole('textbox').fill(testID);

  // click confirm add zone button
  const confirmZoneButton = await page.getByTestId('add-zone-button');
  await confirmZoneButton.waitFor();
  await confirmZoneButton.click();

  // exit edit mode
  await exitEditMode({ page });
};

export const deleteBoard = async ({ page, boardID }) => {
  await page.goto('/my-boards');

  // find the correct board row
  const boardRow = await page.getByTestId(boardID);

  // click the dropdown button
  await boardRow.locator(".my-boards-dropdown-buttons").click();

  // click the delete button
  await page.locator('span').filter({ hasText: /^Delete$/, visible: true, exact: true }).click();

  // click the confirm button
  await page.getByTestId('confirm-delete-button').click();
};

test('create dashboard', async ({ page }) => {
  const testID = crypto.randomUUID();

  await createBoard({ page, testID });

  // create a view
  // await createView({page, testID});

  // create a zone
  await createZone({ page, testID });
})