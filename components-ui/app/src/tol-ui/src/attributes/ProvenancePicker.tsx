/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Checkbox as RSCheckbox } from "rsuite";

import {
  handleProvenanceEntryClick,
  handleProvenanceEntryKeyDownEvent,
  handleProvenancePickerKeyDownEvent,
  SourceTag,
} from "..";

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
  } = props;

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
          onClick={(event) => handleProvenanceEntryClick(event, provenance, toggleProvenance)}
          onKeyDown={(event) => handleProvenanceEntryKeyDownEvent(event, provenance, toggleProvenance)}
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
