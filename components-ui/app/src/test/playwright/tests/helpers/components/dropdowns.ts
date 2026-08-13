// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import type { Locator, Page } from "@playwright/test";

export const selectFromAttributeSelector = async (
  page: Page,
  dropdown: Locator,
  values: string[],
  provenances?: Record<string, string[]>
) => {
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

    const option = await listbox.getByRole("option", { name: value }).first();

    // Select the main option if either:
    // * This is not a field where provenance is considered or available
    // * This is a provenance field, and we want to select the main option
    //   (denoted by the "calc" source)
    // Match by option text in this listbox so similarly named controls cannot conflict.
    if (!provenances?.[value] || provenances[value].includes("calc")) {
      await option.click();

    }

    // Get the provenances provided to select for this value.
    // Remove the "calc" provenance if present, because that refers to the main entry
    const provenancesToSelect = 
      provenances?.[value].filter((provenance) => provenance != "calc") || [];

    // Open the provenance picker and select the desired provenance options if they were provdied
    if (provenancesToSelect.length > 0) {
      // Click the expand button to open the sub-dropdown
      await option.locator(".tol-expand-button").first().click();

      // Wait for the expand animation to complete
      await option.locator(".rs-anim-in").waitFor({ state: "visible" });

      // Click each desired provenance option
      for (const provenance of provenancesToSelect) {
        await option.locator(`[data-provenance="${provenance}"] label`).click();
      }

      // Click the expand button to close the sub-dropdown
      await option.locator(".tol-expand-button").first().click();

      // Wait for the animation to complete
      await option.locator(".rs-anim-collapse").waitFor({ state: "hidden" });
    }
  }

  // Close the dropdown.
  // There's some weird thing where it doesn't register properly for a moment, so unfortunately
  // a manual sleep is needed.
  await dropdown.click();
  await page.waitForTimeout(200);
}

/**
 * Selects the requested values from a dropdown
 * @param page The Playwright page handle
 * @param dropdown Playwright locator handle to the dropdown
 * @param values The values to select
 */
export const selectFromDropdown = async (page: Page, dropdown: Locator, values: string[]) => {
  // The same logic is used to select from an attribute selector, so we can reuse this function.
  // If no provenance options are provided, it does the same thing.
  await selectFromAttributeSelector(page, dropdown, values);
}
