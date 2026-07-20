// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import type { Locator, Page } from "@playwright/test";

import { clickUtilityBarButton } from "../../utility-bar";
import { selectFromDropdown, sleep } from "../..";

/**
 * Configured the provided table component with the given config,
 * with the assumption that the table is newly created (currently empty; non-configured).
 * @param page The Playwright page handle
 * @param table Playwright locator handle to the table to configure
 * @param defaultSort The field to choose in the 'Default Sort' select
 * @param limitColumnVisibility Whether to enable the 'Limit Column Visibility' slider
 * @param activeColumns The columns to choose in the 'Active Columns' dropdown. Columns are added
 * in the order provided in this array.
 */
export const configureTable = async (
  page: Page,
  table: Locator,
  config: {
    defaultSort?: string,
    limitColumnVisibility?: boolean,
    activeColumns?: string[],
  }
) => {
  // Click the Configure Table button
  await clickUtilityBarButton(page, table, "table-config-button");
  const configDrawer = page.locator(".tol-drawer");

  // I unfortunately couldn't find a suitable waiting condition for the opening animation to finish
  await sleep(200)

  // Add the default sort attribute if one was provided
  if (config.defaultSort) {
    await selectFromDropdown(
      page,
      configDrawer.getByTestId("default-sort-dropdown").getByRole("combobox"),
      [config.defaultSort]
    );
  }

  // Toggle the Limit Column Visibility toggle if requested
  if (config.limitColumnVisibility) {
    await configDrawer.getByRole("switch").first().click();
  }

  // Add the active columns if they were provided
  if (config.activeColumns) {    
    await selectFromDropdown(
      page,
      configDrawer.getByTestId("active-columns-dropdown").getByRole("combobox"),
      config.activeColumns
    );
  }
  await sleep(30_000)
  // Save the table
  await configDrawer.getByTestId("save-table-button").click();

  // Wait for the drawer to close
  await configDrawer.waitFor({ state: "hidden", timeout: 5_000 });
}
