/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Page } from "@playwright/test";

import { enterEditMode, exitEditMode } from ".";

export const createBoardID = () => `b_${crypto.randomUUID()}`;

export const createBoard = async (page: Page, boardName: string) => {
  // click the create new board button
  await page.getByTestId("create-new-board-button").click();

  // click the modal
  await page.getByText('Create New Board').click();

  // name the board
  await page.getByRole('textbox').fill(boardName);

  // save the board
  await page.getByRole('button', { name: 'Create' }).click();
};

export const createZone = async (page: Page, zoneName: string) => {
  // enter edit mode
  await enterEditMode(page);

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
  await page.getByRole('textbox').fill(zoneName);

  // click confirm add zone button
  const confirmZoneButton = await page.getByTestId('add-zone-button');
  await confirmZoneButton.waitFor();
  await confirmZoneButton.click();

  // exit edit mode
  await exitEditMode( page );
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