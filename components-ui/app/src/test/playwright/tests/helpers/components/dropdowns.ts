// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import type { Locator, Page } from "@playwright/test";

import { BASE_ATTRIBUTE_PROVENANCE_INDICATOR } from "../../";
import { sleep } from "../sleep";

/**
 * Selects the requested attributes from an AttributeSelector
 * @param page The Playwright page handle
 * @param dropdown Playwright locator handle to the AttributeSelector dropdown
 * @param fields List of fields to select. This can include provenanced fields (i.e. `attribute[source]`)
 */
export async function selectFromAttributeSelector (
  page: Page,
  dropdown: Locator,
  fields: string[],
) {
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

  // `fields` contains an entry for each field separately;
  // reformat it into a record for what to select for each attribute.
  // Each key is the attribute name (has its own MenuItem),
  // each value is the array of provenances to select, where the BASE_ATTRIBUTE_PROVENANCE_INDICATOR
  // constant means the main field entry itself.
  const provenancesForEachAttribute: Record<string, string[]> = {};
  for (const field of fields) {
    // Match the attribute and source part
    const match = field.match(/^(?<attribute>[A-Za-z_]+)(?:\[(?<source>[\S]+)\])?$/);
    if (!(match && match.groups)) {
      throw new Error(`Invalid format: expected '${field}' to be a field`);
    }

    // Add this attribute to the record if it's not there already
    if (!(match.groups.attribute in provenancesForEachAttribute)) {
      provenancesForEachAttribute[match.groups.attribute] = [];
    }

    // Add the provenance (or a special value if the field referring to the base attribute)
    provenancesForEachAttribute[match.groups.attribute].push(
      match.groups.source ?? BASE_ATTRIBUTE_PROVENANCE_INDICATOR
    );
  }

  for (const attribute of Object.keys(provenancesForEachAttribute)) {
    // When the combobox exposes a textbox, fill it with the search term
    const textbox = dropdown.getByRole("textbox");
    if (await textbox.count()) {
      await textbox.fill(attribute);
    }

    const option = await listbox.getByRole("option", { name: attribute }).first();

    // Select the main option if required.
    // Match by option text in this listbox so similarly named controls cannot conflict.
    if (provenancesForEachAttribute[attribute].includes(BASE_ATTRIBUTE_PROVENANCE_INDICATOR)) {
      await option.click();
    }

    // Get the provenances provided to select for this value.
    // Remove the value that indicates the base attribute option should be selected,
    // as these are only the options in the provenance picker
    const provenancesToSelect = provenancesForEachAttribute[attribute].filter(
      provenance => provenance != BASE_ATTRIBUTE_PROVENANCE_INDICATOR
    );

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
  await sleep(page);
}

/**
 * Selects the requested values from a dropdown
 * @param page The Playwright page handle
 * @param dropdown Playwright locator handle to the dropdown
 * @param values The values to select
 */
export async function selectFromDropdown (page: Page, dropdown: Locator, values: string[]) {
  // The same logic is used to select from an attribute selector, so we can reuse this function.
  // If no provenance options are provided, we make every attribute in the `fieldsRecord` have
  // `null` for provenances selected, which just means "select only the field itself, not any of its provenances",
  // which is the behaviour we want here (the provenance pickers don't exist)
  await selectFromAttributeSelector(
    page,
    dropdown,
    values
  );
}
