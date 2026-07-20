// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import type { Locator, Page } from "@playwright/test";
import { sleep } from "../sleep";

/**
 * Selects the requested values from a dropdown
 * @param page The Playwright page handle
 * @param dropdown Playwright locator handle to the dropdown
 * @param values The values to select
 */
export const selectFromDropdown = async (page: Page, dropdown: Locator, values: string[]) => {
  // Make sure the dropdown is ready to be used
  await dropdown.waitFor({ state: "visible" });
  
  // Open the dropdown
  await dropdown.click();

  // NOTE: The area where you select from the dropdown is separated from where you click to open
  // it. It can be reliably selected using `page` because there can only be one open at a time.
  for (const value of values) {
    // Search for the value
    await sleep(1000)
    await page.locator(".rs-search-box-input").fill(value);

    // Select it
    await sleep(1000)
    await page.locator(".rs-check-item").first().click();
  }

  // Close the dropdown.
  // There's some weird thing where it doesn't register properly for a moment, so unfortunately
  // a manual sleep is needed. 
  await sleep(200);
  await dropdown.click();
  await sleep(200);
}
