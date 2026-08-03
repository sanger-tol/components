/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { forwardRef, useState } from "react";
import type {
  HTMLAttributes,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from "react";
import { Animation as RSAnimation, Checkbox as RSCheckbox } from "rsuite";

import {
  AttributeTitle,
  Col,
  ExpandButton,
  Icon,
  SourceTag,
  truncateString,
  TsDataSource,
} from "..";

export interface PMenuItem {
  /**
   * Source identifier shown in the source tag
   */
  source: string;
  /**
   * The attribute this menu item describes
   */
  field: string;
  /**
   * Whether the attribute is marked as authoritative
   */
  authoritative: boolean;
  /**
   * Object type used to resolve attribute metadata
   */
  objectType: string;
  /**
   * Data source to fetch attribute metadata with
   */
  dataSource: TsDataSource;
  /**
   * Whether to display the source tag in the menu item
   */
  displaySource?: boolean;
  /**
   * Optional tooltip content for the menu item
   */
  tooltipContent?: string;
  /**
   * The values in the AttributeSelector that are disabled.
   * This MenuItem is disabled if this contains `field`.
   */
  disabledValues?: any;
  /**
   * The provenances available for this attribute that are displayed in the Provanence picker.
   * If this is not provided (or an empty list), then this attribute does not use Provenance.
   */
  provenancesAvailable?: string[];
  /**
   * Currently selected provenance fields for this attribute
   */
  provenancesSelected?: string[];
  /**
   * Callback fired when provenance selections change
   * (used to update provenances selected state in a parent component)
   */
  onProvenancesChanged?: (newProvenances: string[]) => void
}

/**
 * Renders an attribute selection menu item with optional source display
 * and an expandable provenance picker for configuring selected provenances.
 */
export function MenuItem(props: PMenuItem) {
  const {
    source,
    field,
    authoritative,
    disabledValues,
    objectType,
    dataSource,
    displaySource,
    provenancesAvailable = [],
    provenancesSelected = [],
    onProvenancesChanged,
  } = props;

  const [provenancePickerOpen, setProvenancePickerOpen] = useState(false);
  const PROVENANCE_CHECKBOX_SELECTOR =
    ".tol-provenance-picker .tol-provenance-picker-checkbox input[type='checkbox']";

  const getProvenanceFocusableCheckboxes = (container: HTMLElement) => (
    Array.from(
      container.querySelectorAll<HTMLElement>(
        PROVENANCE_CHECKBOX_SELECTOR
      )
    )
  );

  const handleExpandControlKeyDown = (
    event: ReactKeyboardEvent<HTMLSpanElement>
  ) => {
    // Allow button activation while preventing the parent menu option from being selected.
    if (event.key === "Enter" || event.key === " ") {
      event.stopPropagation();
      return;
    }

    // Move from the expand control into the first provenance checkbox when expanded.
    if (event.key === "ArrowDown" && provenancePickerOpen) {
      const container = event.currentTarget.closest<HTMLElement>(
        ".tol-attribute-selector-menu-item"
      );
      if (!container) return;

      const firstProvenanceCheckbox = getProvenanceFocusableCheckboxes(container)[0];
      if (!firstProvenanceCheckbox) return;

      event.preventDefault();
      event.stopPropagation();
      firstProvenanceCheckbox.focus();
      return;
    }

    if (event.key !== "ArrowLeft") return;

    // Move focus back to the parent menu option from the expand control.
    event.preventDefault();
    event.stopPropagation();

    const menuItem = event.currentTarget.closest<HTMLElement>(
      "li, [role='option'], [role='menuitem']"
    );

    if (!menuItem) return;

    const focusableInItem = menuItem.querySelector<HTMLElement>("[tabindex]");
    (focusableInItem || menuItem).focus();
  };

  const handleProvenancePickerKeyDown = (
    event: ReactKeyboardEvent<HTMLDivElement>
  ) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

    const pickerContainer = event.currentTarget.closest<HTMLElement>(
      ".tol-attribute-selector-menu-item"
    );
    if (!pickerContainer) return;

    const focusableCheckboxes = getProvenanceFocusableCheckboxes(pickerContainer);
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

  const toggleProvenance = (provenance: string) => {
    const isSelected = provenancesSelected.includes(provenance);
    onProvenancesChanged?.(
      isSelected
        ? provenancesSelected.filter(item => item !== provenance)
        : [...provenancesSelected, provenance]
    );
  };

  const restoreProvenanceCheckboxFocus = (
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

  const handleProvenanceEntryClick = (
    event: ReactMouseEvent<HTMLSpanElement>,
    provenance: string
  ) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    // Handle interaction for any nested RSCheckbox target (label/span/input)
    // without allowing the parent menu row to select.
    if (!target.closest(".tol-provenance-picker-checkbox")) return;

    event.stopPropagation();
    toggleProvenance(provenance);
    restoreProvenanceCheckboxFocus(event.currentTarget, provenance);
  };

  const handleProvenanceEntryKeyDown = (
    event: ReactKeyboardEvent<HTMLSpanElement>,
    provenance: string
  ) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    const target = event.target as HTMLElement | null;
    if (!target?.closest(".tol-provenance-picker-checkbox")) return;

    event.preventDefault();
    event.stopPropagation();
    toggleProvenance(provenance);
    restoreProvenanceCheckboxFocus(event.currentTarget, provenance);
  };

  const disabled =
    disabledValues && Object.keys(disabledValues).includes(field);

  const lettersToDisplay = window.innerWidth < 576 ? 30 : 60;

  // The contents of the main item entry showing the non-provenance field
  const MenuItemAttributeTitle = (
    <div className="tol-attribute-selector-menu-item-inner-container">
      <div className="tol-attribute-selector-display-name">
        <AttributeTitle
          objectType={objectType}
          dataSource={dataSource}
          attributeId={field}
          className={disabled ? "disabled" : undefined}
        />
        <div className="tol-attribute-selector-display-key">
          {authoritative === true && <Icon icon="star" />}
          <p>{truncateString(field, lettersToDisplay)}</p>
        </div>
      </div>
    </div>
  );

  // The contents of the expanded area when the expand button on the right of the menu item
  // is clicked. Contains an option for each available provenance
  const ProvenancePicker = forwardRef<
    HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>
  >((props, ref) => (
    <div {...props} ref={ref}>
      <div
        className="tol-provenance-picker"
        role="listbox"
        onKeyDown={handleProvenancePickerKeyDown}
      >
        {provenancesAvailable.map(provenance =>
          <span
            key={provenance}
            className="tol-provenance-picker-entry"
            role="option"
            data-provenance={provenance}
            onClick={(event) => handleProvenanceEntryClick(event, provenance)}
            onKeyDown={(event) => handleProvenanceEntryKeyDown(event, provenance)}
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
    </div>
  ));

  return (
    <Col
      className="tol-attribute-selector-menu-item"
      data-provenance-open={provenancePickerOpen}
    >
      <div key={field} className="tol-attribute-selector-menu-item-container">
        {MenuItemAttributeTitle}
        <span className="tol-attribute-selector-menu-item-right-container">
          {displaySource && source && <SourceTag source={source} />}
          {provenancesAvailable.length > 0 && (
            <span
              // Prevent clicking the expand control from selecting the parent menu option
              onClick={(event) => event.stopPropagation()}
              onKeyDown={handleExpandControlKeyDown}
            >
              <ExpandButton
                testid={`attribute-selector-provenance-toggle-${field}`}
                expanded={provenancePickerOpen}
                setExpanded={setProvenancePickerOpen}
                tooltip={
                  provenancePickerOpen
                    ? "Collapse Provenance Picker"
                    : "Configure Provenance"
                }
              />
            </span>
          )}
        </span>
      </div>
      <RSAnimation.Collapse in={provenancePickerOpen}>
        {(props, ref) => <ProvenancePicker {...props} ref={ref} />}
      </RSAnimation.Collapse>
    </Col>
  );
}
