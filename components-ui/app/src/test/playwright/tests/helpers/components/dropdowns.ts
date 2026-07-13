// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import type { Locator } from "@playwright/test";

/**
 * Selects the requested values from a dropdown
 * @param dropdown Playwright locator handle to the dropdown
 * @param values The values to select
 */
export const selectFromDropdown = async (dropdown: Locator, values: string[]) => {
  // Open the dropdown
  await dropdown.click();

  values.forEach(async (value) => {
    // Search for the value
    await dropdown.locator(".rs-search-box-input").fill(value);

    // Select it
    await dropdown.locator(".rs-check-item").first().click();
  });

  // Close the dropdown
  await dropdown.click();
}
