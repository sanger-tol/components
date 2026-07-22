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

  // Resolve the listbox controlled by this combobox so we always target the right menu.
  const listboxId = await dropdown.getAttribute("aria-controls");
  if (!listboxId) {
    throw new Error("Could not resolve dropdown listbox id from aria-controls.");
  }

  // Get a handle to the listbox with this ID (the area that shows all the clickable options)
  const listbox = page.locator(`[id="${listboxId}"]`);
  await listbox.waitFor({ state: "visible" });

  for (const value of values) {
    // When the combobox exposes a textbox, fill it with the search term
    const textbox = dropdown.getByRole("textbox");
    if (await textbox.count()) {
      await textbox.fill(value);
    }

    // Match by option text in this listbox so similarly named controls cannot conflict.
    await listbox.getByRole("option", { name: value }).first().click();
  }

  // Close the dropdown.
  // There's some weird thing where it doesn't register properly for a moment, so unfortunately
  // a manual sleep is needed.
  await dropdown.click();
  await sleep(200);
}
