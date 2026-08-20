// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { enterEditMode, exitEditMode } from ".";
import { DATASOURCE_INSTANCE_ID } from "../../constants/board";
import { expect, type Page } from "@playwright/test";


function createShortId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().slice(0, 12)}`;
}

/**
 * @returns A random Board ID
 */
export function createBoardId() {
  return createShortId("b");
}
/**
 * @returns A random View ID
 */
export function createViewId() {
  return createShortId("v");
}
/**
 * @returns A random Zone ID
 */
export function createZoneId() {
  return createShortId("z");
}
/**
 * @returns A random Component ID
 */
export function createComponentId() {
  return createShortId("c");
}

export async function createZone(page: Page) {
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

export async function deleteBoard({ page, boardID }) {
  await page.goto("/my-boards");

  // find the correct board row
  const boardRow = await page.getByTestId(boardID);

  // click the dropdown button
  await boardRow.locator(".my-boards-dropdown-buttons").click();

  // click the delete button
  await page.locator("span").filter({ hasText: /^Delete$/, visible: true, exact: true }).click();

  // click the confirm button
  await page.getByTestId("confirm-delete-button").click();
}

export async function addView(page: Page) {
  // click add view button
  const addViewButton = await page.getByTestId("board-add-view-button");
  await addViewButton.click();

  const newViewButton = await page.getByText("New View");
  await newViewButton.click();

  // exit edit mode
  await exitEditMode(page);
}
