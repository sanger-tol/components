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

export const createBoard = async (page: Page, boardName: string) => {
  // click the create new board button
  await page.getByTestId("create-new-board-button").click();

  // click the modal
  await page.getByText("Create New Board").click();

  // name the board
  await page.getByRole("textbox").fill(boardName);

  // save the board
  await page.getByRole("button", { name: "Create" }).click();
};

export const createZone = async (page: Page, zoneName: string) => {
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

  // name the zone
  await page.getByRole("textbox").fill(zoneName);

  // click confirm add zone button
  const confirmZoneButton = await page.getByTestId("add-zone-button");
  await confirmZoneButton.waitFor();
  await confirmZoneButton.click();

  // exit edit mode
  await exitEditMode(page);
};

/**
 * From the my-board page, delete the board with ID `boardId`
 * @param page The Playwright page handle
 * @param boardId The ID of the board to delete
 */
export const deleteBoard = async (page: Page, boardId: string) => {
  await page.goto("/my-boards");

  // find the correct board row
  const boardRow = await page.getByTestId(boardId);

  // click the dropdown button
  await boardRow.locator(".my-boards-dropdown-buttons").click();

  // click the delete button
  await page.locator("span").filter({ hasText: /^Delete$/, visible: true }).click();

  // click the confirm button
  await page.getByTestId("confirm-delete-button").click();
};
