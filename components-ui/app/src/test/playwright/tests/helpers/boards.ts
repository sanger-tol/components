/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Page } from "@playwright/test";

import { enterEditMode, exitEditMode } from ".";

/**
 * @returns A random Board ID
 */
export const createBoardId = () => `b_${crypto.randomUUID()}`;
/**
 * @returns A random View ID
 */
export const createViewId  = () => `v_${crypto.randomUUID()}`;
/**
 * @returns A random Zone ID
 */
export const createZoneId  = () => `z_${crypto.randomUUID()}`;

export const createZone = async (page: Page) => {
  // enter edit mode
  await enterEditMode(page);

  // click add zone button
  const addZoneButton = await page.getByTestId("open-add-zone-modal-button");
  await addZoneButton.click();

  // choose the dataspace picker
  await page.getByTestId("dataspace-picker").click();

  // select the dataspace
  await page.locator("[data-key=\"tol_production\"]").click();

  // choose the object type picker
  await page.getByTestId("object-type-picker").click();

  // select the object type
  await page.getByText("Curation").click();


  // click confirm add zone button
  const confirmZoneButton = await page.getByTestId("add-zone-button");
  await confirmZoneButton.waitFor();
  await confirmZoneButton.click();

  // exit edit mode
  await exitEditMode(page);
};

export const deleteBoard = async ({ page, boardID }) => {
  await page.goto("/my-boards");

  // find the correct board row
  const boardRow = await page.getByTestId(boardID);

  // click the dropdown button
  await boardRow.locator(".my-boards-dropdown-buttons").click();

  // click the delete button
  await page.locator("span").filter({ hasText: /^Delete$/, visible: true, exact: true }).click();

  // click the confirm button
  await page.getByTestId("confirm-delete-button").click();
};

export const addView = async (page: Page) => {
  // enter edit mode
  await enterEditMode(page);

  // click add view button
  const addViewButton = await page.getByTestId("board-add-view-button");
  await addViewButton.click();

  const newViewButton = await page.getByTestId("board-new-view-button");
  await newViewButton.waitFor();
  await newViewButton.click();
  
  // exit edit mode
  await exitEditMode(page);
};
