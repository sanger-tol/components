// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import type { Page } from "@playwright/test";

import { clickUtilityBarButton } from "../utility-bar";

/**
 * Configures the `tableIndex`th table with the given config,
 * with the assumption that the table is newly created (currently empty; non-configured).
 * @param page The Playwright page handle
 * @param tableIndex Out of all table components on the screen, which one is it? Zero-indexed
 * @param defaultSort The field to choose in the 'Default Sort' select
 * @param limitColumnVisibility Whether to enable the 'Limit Column Visibility' slider
 * @param activeColumns The columns to choose in the 'Active Columns' dropdown. Columns are added
 * in the order provided in this array.
 */
export const configureTable = async (
  page: Page,
  tableIndex: number,
  defaultSort?: string,
  limitColumnVisibility?: boolean,
  activeColumns?: string[],
) => {
  // Click the Configure Table button
  await clickUtilityBarButton(page, "table-config-button", tableIndex);

  // Add the default sort attribute if one was provided
  if (defaultSort) {
    // Click the dropdown
    await page.getByTestId("default-sort-dropdown").click();

    // Search for the attribute
    await page.locator(".rs-search-box-input").fill(defaultSort);

    // Select it
    await page.locator(".rs-check-item").first().click();

    // Hide the dropdown
    await page.getByTestId("default-sort-dropdown").click();
  }

  // Toggle the Limit Column Visibility toggle if requested
  if (limitColumnVisibility) {
    await page.getByRole("switch").first().click();
  }

  // Add the active columns if they were provided
  if (activeColumns) {
    // Click the dropdown
    await page.getByTestId("active-columns-dropdown").click();
  
    for (const columnName of activeColumns) {
      // Search for the attribute
      await page.locator(".rs-search-box-input").fill(columnName);

      // Select it
      await page.locator(".rs-check-item").first().click();
    }

    // Hide the dropdown
    await page.getByTestId("active-columns-dropdown").click();
  }

  // Save the table
  await page.getByTestId("save-table-button").click();

  // Wait for the drawer to close
  await page.locator(".tol-drawer").waitFor({ state: "hidden", timeout: 5_000 });
}
