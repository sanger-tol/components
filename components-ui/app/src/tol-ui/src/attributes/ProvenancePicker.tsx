/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from "react";
import { Checkbox as RSCheckbox } from "rsuite";

import { SourceTag } from "..";

export interface PProvenancePicker {
  /**
   * The provenances available for this attribute that are displayed in the Provanence picker.
   * If this is not provided (or an empty list), then this attribute does not use Provenance.
   */
  provenancesAvailable: string[];
  /**
   * Currently selected provenance fields for this attribute
   */
  provenancesSelected: string[];
  /**
   * Callback fired when provenance selections change
   * (used to update provenances selected state in a parent component)
   */
  onProvenancesChanged: (newProvenances: string[]) => void;
  /**
   * Helper function for keyboard navigation.
   * It's defined in the parent MenuItem because it's needed there too.
   */
  getCheckboxesInProvenancePicker: (menuItem: HTMLElement) => HTMLElement[];
}

/**
 * The contents of the expanded area when the expand button on the right of a MenuItem
 * is clicked. Contains an option for each available provenance
 */
export function ProvenancePicker(props: PProvenancePicker) {
  const {
    provenancesAvailable,
    provenancesSelected,
    onProvenancesChanged,
    getCheckboxesInProvenancePicker
  } = props;

  /**
   * Used for keyboard navigation: the ArrowUp and ArrowDown buttons cycle through the entries
   * in the provenance picker
   */
  const handleProvenancePickerKeyDownEvent = (
    event: ReactKeyboardEvent<HTMLDivElement>
  ) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

    const pickerContainer = event.currentTarget.closest<HTMLElement>(
      ".tol-attribute-selector-menu-item"
    );
    if (!pickerContainer) return;

    const focusableCheckboxes = getCheckboxesInProvenancePicker(pickerContainer);
    if (!focusableCheckboxes.length) return;

    const currentTarget = event.target as Node;
    const currentIndex = focusableCheckboxes.findIndex(checkbox =>
      checkbox === event.target || checkbox.contains(currentTarget)
    );
    if (currentIndex < 0) return;

    const direction = event.key === "ArrowDown" ? 1 : -1;
    const nextIndex = currentIndex + direction;

    if (nextIndex >= 0 && nextIndex < focusableCheckboxes.length) {
      // Consume ArrowUp/ArrowDown only when moving within the provenance list.
      event.preventDefault();
      event.stopPropagation();
      focusableCheckboxes[nextIndex].focus();
    }
  };

  /**
   * Toggles a provenance for this field
   */
  const toggleProvenance = (provenance: string) => {
    const isSelected = provenancesSelected.includes(provenance);
    onProvenancesChanged(
      isSelected
        ? provenancesSelected.filter(item => item !== provenance)
        : [...provenancesSelected, provenance]
    );
  };

  /**
   * Sets the element in focus as the checkbox in a specific provenance entry
   * in the provenance picker. Needed for keyboard navigation
   */
  const focusCheckboxInProvenanceEntry = (
    optionElement: HTMLSpanElement,
    provenance: string
  ) => {
    const menuItem = optionElement.closest<HTMLElement>(".tol-attribute-selector-menu-item");
    if (!menuItem) return;

    // Re-focus the same checkbox after state updates to keep keyboard navigation active.
    requestAnimationFrame(() => {
      const refreshedOption = menuItem.querySelector<HTMLElement>(
        `[data-provenance="${provenance}"]`
      );
      const checkboxInput = refreshedOption?.querySelector<HTMLInputElement>(
        ".tol-provenance-picker-checkbox input[type='checkbox']"
      );
      checkboxInput?.focus();
    });
  };

  /**
   * Selects or deselects a provenance option for this field when its provenance entry is clicked
   */
  const handleProvenanceEntryClick = (
    event: ReactMouseEvent<HTMLSpanElement>,
    provenance: string
  ) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    // Handle interaction for any nested RSCheckbox target (label/span/input)
    // without allowing the parent menu row to select.
    if (!target.closest(".tol-provenance-picker-checkbox")) return;

    // Prevent weird interactions with the rsuite menu item
    event.stopPropagation();

    // Select (or deselect) this provenance
    toggleProvenance(provenance);

    // Because of keyboard navigation shenanigans, we need to go back to having specifically
    // the checkbox in the provenance entry in focus
    focusCheckboxInProvenanceEntry(event.currentTarget, provenance);
  };

  /**
   * Use Enter or Space to select the provenance entry highlighted through keyboard navigation
   */
  const handleProvenanceEntryKeyDownEvent = (
    event: ReactKeyboardEvent<HTMLSpanElement>,
    provenance: string
  ) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    const target = event.target as HTMLElement | null;
    if (!target?.closest(".tol-provenance-picker-checkbox")) return;

    // Prevent weird interactions with the rsuite menu item
    event.preventDefault();
    event.stopPropagation();

    // Select (or deselect) this provenance
    toggleProvenance(provenance);

    // Because of keyboard navigation shenanigans, we need to go back to having specifically
    // the checkbox in the provenance entry in focus
    focusCheckboxInProvenanceEntry(event.currentTarget, provenance);
  };

  return (
    <div
      className="tol-provenance-picker"
      role="listbox"
      onKeyDown={handleProvenancePickerKeyDownEvent}
    >
      {provenancesAvailable.map(provenance =>
        <span
          key={provenance}
          className="tol-provenance-picker-entry"
          role="option"
          data-provenance={provenance}
          onClick={(event) => handleProvenanceEntryClick(event, provenance)}
          onKeyDown={(event) => handleProvenanceEntryKeyDownEvent(event, provenance)}
        >
          <RSCheckbox
            className="tol-provenance-picker-checkbox"
            checked={provenancesSelected.includes(provenance)}
          >
            <SourceTag
              source={provenance}
            />
          </RSCheckbox>
        </span>
      )}
    </div>
  )
}
