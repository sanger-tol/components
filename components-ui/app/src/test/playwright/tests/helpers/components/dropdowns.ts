// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import type { Locator, Page } from "@playwright/test";

import type { TAttributeAndProvenanceList } from "../..";

/**
 * Selects the requested attributes from an AttributeSelector
 * @param page The Playwright page handle
 * @param dropdown Playwright locator handle to the AttributeSelector dropdown
 * @param fieldsRecord The fields to select from this AttributeSelector (including the main field and any provenance options)
 */
export const selectFromAttributeSelector = async (
  page: Page,
  dropdown: Locator,
  fieldsRecord: TAttributeAndProvenanceList,
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

  for (const value of Object.keys(fieldsRecord)) {
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
    if (!(fieldsRecord?.[value]) || fieldsRecord[value]?.includes("calc")) {
      await option.click();
    }

    // Get the provenances provided to select for this value.
    // Remove the "calc" provenance if present, because that refers to the main entry.
    // Same if the provenances is `null`, as that indicates this isn't a provenanced attribute (so just select the normal one)
    console.log(`${fieldsRecord[value]}, ${Boolean(fieldsRecord[value])}`)
    const provenancesToSelect = fieldsRecord[value]
      ? fieldsRecord[value].filter(provenance => provenance != "calc")
      : [];

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
  // If no provenance options are provided, we make every attribute in the `fieldsRecord` have
  // `null` for provenances selected, which just means "select only the field itself, not any of its provenances",
  // which is the behaviour we want here (the provenance pickers don't exist)
  await selectFromAttributeSelector(
    page,
    dropdown,
    Object.fromEntries(values.map(value => [value, null]))
  );
}
