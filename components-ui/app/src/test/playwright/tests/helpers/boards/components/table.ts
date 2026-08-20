// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import type { Locator, Page } from "@playwright/test";

import { clickUtilityBarButton } from "../../utility-bar";
import { selectFromAttributeSelector, selectFromDropdown } from "../..";
import type { IConfigureTable } from "../../../interfaces";

/**
 * Configured the provided table component with the given config,
 * with the assumption that the table is newly created (currently empty; non-configured).
 * @param page The Playwright page handle
 * @param table Playwright locator handle to the table to configure
 * @param config Table configuration options
 */
export const configureTable = async (
  page: Page,
  table: Locator,
  config: IConfigureTable,
) => {
  // Click the Configure Table button
  await clickUtilityBarButton(page, table, "table-config-button");
  const configDrawer = page.locator(".tol-drawer");

  // I unfortunately couldn't find a suitable waiting condition for the opening animation to finish
  await page.waitForTimeout(200);

  // Add the default sort attribute if one was provided
  if (config.defaultSort) {
    await selectFromDropdown(
      page,
      configDrawer.getByRole("combobox").nth(0),
      [config.defaultSort]
    );
  }

  // Toggle the Limit Column Visibility toggle if requested
  if (config.limitColumnVisibility) {
    await configDrawer.locator(".rs-toggle").first().click();
  }

  // Add the active columns if they were provided
  if (config.fields) {    
    await selectFromAttributeSelector(
      page,
      configDrawer.getByRole("combobox").nth(1),
      config.fields
    )
  }

  // Save the table
  await configDrawer.getByTestId("save-table-button").click();

  // Wait for the drawer to close
  await configDrawer.waitFor({ state: "hidden", timeout: 5_000 });
}
