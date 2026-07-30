// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT
import { expect, Page } from "@playwright/test";

import { enterEditMode, exitEditMode } from ".";
import { DATASOURCE_INSTANCE_ID } from "../../constants/board";

const createShortId = (prefix: string) => `${prefix}_${crypto.randomUUID().slice(0, 12)}`;

/**
 * @returns A random Board ID
 */
export const createBoardId = () => createShortId("b");
/**
 * @returns A random View ID
 */
export const createViewId = () => createShortId("v");
/**
 * @returns A random Zone ID
 */
export const createZoneId = () => createShortId("z");
/**
 * @returns A random Component ID
 */
export const createComponentId = () => createShortId("c");

export const createZone = async (page: Page) => {
  // enter edit mode
  await enterEditMode(page);

  // click add zone button
  const addZoneButton = await page.getByTestId("open-add-zone-modal-button");
  await addZoneButton.click();

  // wait for the asynchronous dataspace options before opening the picker
  const dataspacePicker = page.getByTestId("dataspace-picker");
  await expect(dataspacePicker).not.toHaveClass(/rs-picker-loading/);
  await dataspacePicker.click();

  // select the dataspace;
  await page.locator(`[data-key="${DATASOURCE_INSTANCE_ID}"]`).click();

  // choose the object type picker
  const objectTypePicker = page.getByTestId("object-type-picker");
  await objectTypePicker.waitFor({ state: "visible" });
  await objectTypePicker.click();

  // select the object type
  const curationOption = page.getByText("Curation", { exact: true });
  await curationOption.waitFor({ state: "visible" });
  await curationOption.click();


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
  // click add view button
  const addViewButton = await page.getByTestId("board-add-view-button");
  await addViewButton.click();

  const newViewButton = await page.getByText("New View");
  await newViewButton.click();

  // exit edit mode
  await exitEditMode(page);
};
