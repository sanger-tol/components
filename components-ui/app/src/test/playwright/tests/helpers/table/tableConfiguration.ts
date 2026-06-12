// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { Page } from "@playwright/test";

/**
 * Adds the attribute `attribute` as the active column to an empty table
 * 
 * @param page The Playwright page handle
 * @param componentIndex Out of all the table components on the board, which one is it?
 * Zero-indexed 
 * @param attribute The attribute to add as an active column
 */
export const configureTable = async (
  page: Page,
  componentIndex: number,
  attribute: string,
) => {
  // click the config button
  await page.getByTestId(`table-config-button`).nth(componentIndex).click();

  // click the second attribute selector dropdown
  await page.getByRole("combobox").nth(1).click();

  // enter the attribute
  await page.locator(".rs-search-box-input").fill(attribute);
  await page.getByText(attribute).click();
  const text = await page.locator(".tol-attribute-selector-display-key").textContent();

  // check the checkbox for the attribute
  await page.locator(`[role="checkbox"][value="${text}"]`).first().setChecked(true);

  // click again to hide dropdown
  await page.getByRole("combobox").nth(1).click();

  // click to save the table
  await page.getByTestId(`save-table-button`).click();
};
