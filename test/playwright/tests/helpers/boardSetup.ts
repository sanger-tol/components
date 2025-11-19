// SPDX-FileCopyrightText: 2025 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { expect, test } from '@playwright/test';
import { sleep } from './sleep';

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

const createView = async ({ page, testID }) => { };

const createZone = async ({ page, testID }) => {
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

  // click add zone button
  const confirmZoneButton = await page.getByTestId('add-zone-button');
  await confirmZoneButton.waitFor();
  await confirmZoneButton.click();
};

export const deleteBoard = async ({ page, testID }) => {
  await page.goto('/my-boards');

  // find the correct board row
  const boardRow = await page.getByTestId(testID);

  // click the dropdown button
  await boardRow.locator(".my-boards-dropdown-buttons").click();

  // click the delete button
  await page.locator('span').filter({ hasText: /^Delete$/, visible: true, exact: true }).click();

  // click the confirm button
  await page.getByTestId('confirm-delete-button').click();
};

export const setupBoard = async ({ page, testID }) => {
  // create a board
  await createBoard({ page, testID });

  // create a view
  // await createView({page, testID});

  // create a zone
  await createZone({ page, testID });
}
