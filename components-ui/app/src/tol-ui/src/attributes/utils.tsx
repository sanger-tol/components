/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type {
  Dispatch,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  SetStateAction,
} from "react";

import {
  isValidDate,
  normaliseCaps,
  PopUpMessage,
  PROVENANCE_IN_FIELD_REGEX,
} from "..";
import type {
  IAllowedCardinality,
  IEntityMeta,
  IFilter,
  IFilterOperatorOptions,
  TDescribedFilters,
  TFilterOperatorType,
} from "..";

export function getFlattenedMetaData(
  entityMeta: IEntityMeta,
  endpoint: string,
  attribute?: string
) {
  return attribute
    ? entityMeta?.flatAttributes?.[endpoint]?.[attribute]
    : entityMeta?.flatAttributes?.[endpoint];
}

export function filterAttributes(
  entityMeta: IEntityMeta,
  endpoint: string,
  allowedTypes: string[] | undefined,
  selectedSources: string[],
  recommendedOn: boolean,
  allowedCardinality: IAllowedCardinality | undefined,
  customAttributeSelection: string[] | undefined
) {
  const filteredAttributes = Object.entries(
    getFlattenedMetaData(entityMeta, endpoint)
  ).filter(([key, value]) => {
    const meta: any = value;
    const typeMatch = !allowedTypes || allowedTypes.includes(meta.python_type);
    const sourceMatch =
      selectedSources.length === 0 ||
      (selectedSources.includes("undefined")
        ? !meta.source || selectedSources.includes(meta.source)
        : selectedSources.includes(meta.source));
    const recommendedMatch = meta.authoritative === true;
    const cardinalityMatch =
      !allowedCardinality ||
      (meta.cardinality &&
        ((allowedCardinality.operator === ">" &&
          meta.cardinality > allowedCardinality.value) ||
          (allowedCardinality.operator === "<" &&
            meta.cardinality < allowedCardinality.value) ||
          (allowedCardinality.operator === "=" &&
            meta.cardinality === allowedCardinality.value) ||
          (allowedCardinality.operator === ">=" &&
            meta.cardinality >= allowedCardinality.value) ||
          (allowedCardinality.operator === "<=" &&
            meta.cardinality <= allowedCardinality.value)));
    return (
      (recommendedOn ? recommendedMatch : true) &&
      typeMatch &&
      sourceMatch &&
      cardinalityMatch &&
      (!customAttributeSelection || customAttributeSelection.includes(key))
    );
  });

  return formatFilteredAttributes(filteredAttributes);
}

export function getAttributeDetail(
  entityMeta: IEntityMeta,
  endpoint: string,
  attribute: string,
  detail: string
) {
  switch (detail) {
    case "display_name":
      return (
        entityMeta?.flatAttributes?.[endpoint]?.[attribute]?.display_name ||
        normaliseCaps(attribute)
      );
    case "description":
      return (
        entityMeta?.flatAttributes?.[endpoint]?.[attribute]?.description || ""
      );
    case "source":
      return entityMeta?.flatAttributes?.[endpoint]?.[attribute]?.source || "";
    case "python_type":
      return (
        entityMeta?.flatAttributes?.[endpoint]?.[attribute]?.python_type || ""
      );
    case "authoritative":
      return entityMeta?.flatAttributes?.[endpoint]?.[attribute]?.authoritative;
  }

  return entityMeta?.flatAttributes?.[endpoint]?.[attribute] || {};
}

export function getAllAttributeData(
  attributes: string[],
  entityMeta: IEntityMeta,
  objectType: string
) {
  return attributes.reduce((acc, attr) => {
    const attributeData = getFlattenedMetaData(entityMeta, objectType, attr);
    return {
      ...acc,
      [attr]: attributeData,
    };
  }, {});
}

export function formatFilteredAttributes(attributes: any) {
  // This is specific for the attribute selector and MultiSelect
  return attributes.map((attribute: any) => {
    const { object_type, relationship_name } = attribute[1];
    return {
      label: attribute[0],
      value: attribute[0],
      object_type,
      relationship_name:
        normaliseCaps(relationship_name) ||
        `${normaliseCaps(object_type)} (Current Object Type)`,
    };
  });
}

export function attributeSelectorSearchBy(keyword: string, label: any, entityMeta: IEntityMeta, objectType: string) {
  const name = getAttributeDetail(
    entityMeta,
    objectType,
    label,
    "display_name"
  ).toLowerCase();
  const description = getAttributeDetail(
    entityMeta,
    objectType,
    label,
    "description"
  ).toLowerCase();
  const kw = keyword.toLowerCase();

  return name.includes(kw) || label.includes(kw) || description.includes(kw);
};


export function handleSetAttribute(
  newAttribute: string[],
  maxSelections: number,
  setAttributes: (attrs: string[]) => void,
  entityMeta: IEntityMeta,
  objectType: string,
  setAttributeMeta?: any
) {
  if (maxSelections) {
    if (maxSelections === 1 && newAttribute.length > 1) {
      setAttributes([newAttribute[newAttribute.length - 1]]);
      return;
    } else if (newAttribute.length > maxSelections) {
      PopUpMessage({
        type: "warning",
        message: `You can select a maximum number of ${maxSelections} items.`,
      });
      return;
    }
  }
  setAttributes(newAttribute);

  if (setAttributeMeta) {
    const allAttributeData = getAllAttributeData(
      newAttribute,
      entityMeta,
      objectType
    );
    setAttributeMeta(allAttributeData);
  }
};

export function renderTotalSelectedItems(
  values: string[],
  renderFunction: (value: string) => JSX.Element,
  populatedFieldType: string,
  additionalPopulatedFieldData?: any,
  numPopulatedFields?: number,
) {
  if (values.length === 1) {
    return renderFunction(values[0]);
  }
  return `${values.length} ${populatedFieldType}s selected${additionalPopulatedFieldData ||
    `; ${numPopulatedFields} ${numPopulatedFields === 1 ? "filter" : "filters"
    } populated.`
    }`;
};

/**
 * Generates user-readable text ("prose") describing an `and_` filter
 * 
 * @param operator An object entry representing one operator in a filter
 * @returns Prose to be displayed next to the operator in the filter
 */
export function getProseForAndFilters(
  [operatorType, operatorOptions]: [TFilterOperatorType, IFilterOperatorOptions]
): string {
  // Account for date edge case.
  // To avoid false positives, only format as a date if it's in a recognised format
  const formattedValue = isValidDate(operatorOptions.value)
    ? new Date(operatorOptions.value).toLocaleDateString()
    : operatorOptions.value;

  // All proses start with "must" or "must not" to describe an operator
  // (depending on whether it's negated)
  let prose = "";
  if (operatorOptions.negate) {
    prose += "must not";
  } else {
    prose += "must";
  }

  // The rest of the message is shaped by the type of operator
  switch (operatorType) {
    case "exists":
      // The "exists" operator does not concern the exact value. It simply checks that one exists
      prose += " exist";
      break;
    case "contains":
      prose += ` have a value containing ${formattedValue}`;
      break;
    case "eq":
      prose += ` equal ${formattedValue}`;
      break;
    case "gt":
      prose += ` be greater than ${formattedValue}`;
      break;
    case "gte":
      prose += ` be greater than or equal to ${formattedValue}`;
      break;
    case "lt":
      prose += ` be less than ${formattedValue}`;
      break;
    case "lte":
      prose += ` be less than or equal to ${formattedValue}`;
      break;
    case "in_list":
      // Even though this was from a multi-select,
      // it's still very possible the user only selected one option.
      // In that case, operate similarly to the "eq" operator.
      // However, I have chosen to change the message to differentiate it from said operator
      if ((formattedValue as Array<any>).length == 1) {
        prose += ` be ${formattedValue}`;
        break;
      }

      prose += " be one of"

      formattedValue.forEach((item: string, index: number) => {
        if (index == 0) {
          // First item in the list
          prose += ` ${item}`;
        } else if (index == formattedValue.length - 1) {
          // Last item in the list
          prose += ` or ${item}`;
        } else {
          // Middle items
          prose += `, ${item}`;
        }
      });

      break;
  }

  return prose;
}

export function generateFilterDescriptions(filter?: IFilter): TDescribedFilters {
  // Account for `filter` being undefined
  if (!filter) {
    return {};
  }

  let describedFilters: TDescribedFilters = {};
  
  // `and_` filters.
  // We first check to see whether they exist, to allow inner code to assume so
  if (filter.and_) {
    for (const [attribute, operators] of Object.entries(filter.and_)) {
      for (const operator of Object.entries(operators)) {
        if (!describedFilters[attribute]) describedFilters[attribute] = [];

        describedFilters[attribute].push(getProseForAndFilters(
          operator as [TFilterOperatorType, IFilterOperatorOptions]
        ));
      }
    }
  }

  return describedFilters;
}

/**
 * Devises the provenance version of an attribute, in the format the API understands:
 * the field (`baseField`) alongside the chosen `provenance`.
 * In the front-end, these are treated like they're attributes themselves.
 * @param baseAttribute The attribute to get a provenance version of
 * @param provenance Which provenance this is
 * @returns A provenanced field made from the base attribute `baseAttribute` and source `provenance`
 */
export function getProvenanceFieldName(baseAttribute: string, provenance: string): string {
  return `${baseAttribute}[${provenance}]`;
}

/**
 * Checks whether the provided `field` is a normal attribute or a provenance specification
 * of an attribute
 * @param field The field to check
 * @returns The boolean indicating whether it is a provenance field
 */
export function isProvenanceField(field: string): boolean {
  return PROVENANCE_IN_FIELD_REGEX.test(field);
}

/**
 * Checks whether the provided `field` is specifically a provenance specification of `baseAttribute`
 * @param field The field to check
 * @param baseAttribute The attribute we want to see if `field` is a provenance version of
 */
export function isProvenanceFieldOfAttribute(field: string, baseAttribute: string): boolean {
  return field.startsWith(`${baseAttribute}[`);
}

/**
 * Extracts from `fields` the answer to the following question: Which provenances are selected
 * for `attribute`?
 * ["genus", "scientific_name[sts]", "scientific_name", "scientific_name[goat]"] -> ["sts", "goat"]
 * @param fields The list of fields to search. A field could be a table column. It can include
 * both attribute and provenance.
 * @param attribute The base attribute whose provenances we're interested in.
 * @returns The sources/provenances present for the provided attribute
 */
export function extractProvenancesForAttribute(fields: string[], attribute: string): string[] {
  return fields
    .filter(field => isProvenanceFieldOfAttribute(field, attribute))
    .flatMap(field => {
      const match = field.match(PROVENANCE_IN_FIELD_REGEX);
      return match?.[1] ? [match[1]] : [];
    });
}

/**
 * Updates the state storing the selected fields in AttributeSelector to have the `selectedProvenances`
 * for the attribute `attribute`. This is called when the selected provenances in a ProvenancePicker
 * change.
 * @param fields The state storing all fields selected in the AttributeSelector component
 * @param setFields The React state setter for the `fields` state, used to update it at the end of the function
 * @param attribute The base attribute that we're changing the provenced fields of
 * @param selectedProvenances The provenances the user has selected in the ProvenancePicker for the attribute `attribute`
 * @returns `undefined`; The output is via `setFields`, not a return value.
 */
export function updateProvenanceFields(
  fields: string[],
  setFields: (newFields: string[]) => void,
  attribute: string,
  selectedProvenances: string[],
) {
  // Remove existing provenance fields for this attribute
  // (we'll re-insert it all from scratch, which will take into account any changes)
  const everythingButTheProvenanceFieldsOfThisAttribute = fields.filter(
    field => !isProvenanceFieldOfAttribute(field, attribute)
  );
  
  // Add new provenance entries
  const newProvenanceFieldsForThisAttribute = selectedProvenances.map(
    provenance => getProvenanceFieldName(attribute, provenance)
  );
  
  // Update the fields state
  setFields([
    ...everythingButTheProvenanceFieldsOfThisAttribute,
    ...newProvenanceFieldsForThisAttribute
  ]);
}

/**
 * Runs when a keydown event is detected on the attribute selector,
 * which adds keyboard navigation to provenance dropdowns.
 * 
 * On a menu item, ArrowRight will focus the provenance toggle expand button.
 * Focus can be placed back on the menu item with ArrowLeft.
 * If this button is pressed to open the provenance picker, the entries in the provenance pickers
 * will be considered at the same level as the base menu items
 * (so they can all be cycled through with ArrowUp and ArrowDown).
 */
export function handleAttributeSelectorKeyNavigation(
  event: ReactKeyboardEvent<HTMLDivElement>
) {
  const attributeSelector = event.target as HTMLElement | null;
  if (!attributeSelector) return;

  // The picker owns navigation between its checkboxes and back out to the menu.
  // Leaving those events here as well would move focus twice for a single key press.
  if (attributeSelector.closest(".tol-provenance-picker")) return;

  // Flatten each expanded picker into the menu's focus order directly after its parent row.
  // This keeps arrows predictable without exposing the visual nesting to keyboard users.
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    // Work from RSuite's outer row rather than a nested label or checkbox, since the event target
    // differs depending on which part of the row currently has focus.
    const currentMenuItem = attributeSelector.closest<HTMLElement>(".rs-check-item");
    if (!currentMenuItem) return;

    const menuItems = getAttributeSelectorMenuItems(attributeSelector);
    const currentMenuItemIndex = menuItems.indexOf(currentMenuItem);
    if (currentMenuItemIndex < 0) return;

    let target: HTMLElement | undefined;
    if (event.key === "ArrowDown") {
      // Provenances visually follow their parent, so enter an open picker before the next row.
      const provenanceCheckboxes = getCheckboxesInProvenancePicker(currentMenuItem);
      target = provenanceCheckboxes[0] ?? menuItems[currentMenuItemIndex + 1];
    } else {
      // An open picker on the previous row is likewise the item immediately above this row.
      const previousMenuItem = menuItems[currentMenuItemIndex - 1];
      const previousProvenanceCheckboxes = previousMenuItem
        ? getCheckboxesInProvenancePicker(previousMenuItem)
        : [];
      target = previousProvenanceCheckboxes[previousProvenanceCheckboxes.length - 1]
        ?? previousMenuItem;
    }
    if (!target) return;

    // RSuite only knows about its own menu rows, so suppress its navigation when moving through
    // the combined row-and-provenance focus order.
    event.preventDefault();
    event.stopPropagation();

    if (target.classList.contains("rs-check-item")) {
      focusAttributeSelectorMenuItem(target);
    } else {
      target.focus();
    }
  } else if (event.key === "ArrowRight") {
    // Get the provenance expand button element
    const selectableContainer = attributeSelector.closest(".rs-check-item") || attributeSelector;
    const expandButton = selectableContainer.querySelector<HTMLButtonElement>(
      "[data-testid^='attribute-selector-provenance-toggle-']"
    );
    if (!expandButton) return;

    // Focus it
    event.preventDefault();
    expandButton.focus();
  }
};

/**
 * Helper for utility functions surrounding keyboard navigation in MenuItem and ProvenancePicker:
 * gets a reference to every checkbox element in the provenance picker of a menu item
 * @param menuItem A reference to the menu item containing the provenance picker we're interested in
 * @returns An array of references to checkboxes in the provenance picker
 */
function getCheckboxesInProvenancePicker (menuItem: HTMLElement) {
  return Array.from(
    menuItem.querySelectorAll<HTMLElement>(
      ".tol-provenance-picker .tol-provenance-picker-checkbox input[type='checkbox']"
    )
  )
};

function getAttributeSelectorMenuItems(element: HTMLElement) {
  const currentMenuItem = element.closest<HTMLElement>(".rs-check-item");
  if (!currentMenuItem) return [];

  // The parent fallback keeps this helper useful in tests and in unwrapped RSuite menu layouts.
  const menu = currentMenuItem.closest<HTMLElement>(".rs-picker-check-menu")
    ?? currentMenuItem.parentElement;
  if (!menu) return [];

  // Restrict the result to AttributeSelector rows in case the RSuite menu contains other controls.
  return Array.from(menu.querySelectorAll<HTMLElement>(".rs-check-item"))
    .filter(menuItem => menuItem.querySelector(".tol-attribute-selector-menu-item"));
}

function focusAttributeSelectorMenuItem(menuItem: HTMLElement) {
  // RSuite often places the tab stop on an input inside the row rather than on the row itself.
  const focusableInItem = menuItem.querySelector<HTMLElement>("[tabindex]");
  (focusableInItem ?? menuItem).focus();
}

/**
 * Handles keyboard navigation for the expand button in MenuItem that opens the ProvenancePicker
 * (i.e. activating it with Enter or Space, and moving from it to the menu item above it,
 * or the menu item below it, or the first provenance entry below it, depending on whether
 * the provenance picker is expanded)
 */
export function handleExpandButtonKeyDownEvent (
  event: ReactKeyboardEvent<HTMLSpanElement>,
  isProvenancePickerOpen: boolean,
) {
  // Allow button activation while preventing the parent menu option from being selected.
  if (event.key === "Enter" || event.key === " ") {
    event.stopPropagation();
    return;
  }

  // Move from the expand control into the first provenance checkbox when expanded.
  if (event.key === "ArrowDown" && isProvenancePickerOpen) {
    const container = event.currentTarget.closest<HTMLElement>(
      ".tol-attribute-selector-menu-item"
    );
    if (!container) return;

    const firstProvenanceCheckbox = getCheckboxesInProvenancePicker(container)[0];
    if (!firstProvenanceCheckbox) return;

    event.preventDefault();
    event.stopPropagation();
    firstProvenanceCheckbox.focus();
  } else if (event.key === "ArrowLeft") {
    // Move focus back to the parent menu option from the expand control.
    event.preventDefault();
    event.stopPropagation();

    const menuItem = event.currentTarget.closest<HTMLElement>("[role='option']");
    if (!menuItem) return;

    const focusableInItem = menuItem.querySelector<HTMLElement>("[tabindex]");
    (focusableInItem || menuItem).focus();
  }
};

/**
 * Used for keyboard navigation in ProvenancePicker: the ArrowUp and ArrowDown buttons cycle
 * through each provenance option
 */
export function handleProvenancePickerKeyDownEvent(
  event: ReactKeyboardEvent<HTMLDivElement>
) {
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

  // Navigation within the picker is independent of RSuite's top-level menu navigation.
  if (nextIndex >= 0 && nextIndex < focusableCheckboxes.length) {
    event.preventDefault();
    event.stopPropagation();
    focusableCheckboxes[nextIndex].focus();
    return;
  }

  // At a picker boundary, move focus explicitly instead of allowing the event to reach RSuite.
  // Provenance entries use role="option", so RSuite otherwise mistakes them for top-level rows
  // and cycles through the picker instead of exiting it.
  const menuItems = getAttributeSelectorMenuItems(event.currentTarget);
  const currentMenuItem = event.currentTarget.closest<HTMLElement>(".rs-check-item");
  if (!currentMenuItem) return;

  const currentMenuItemIndex = menuItems.indexOf(currentMenuItem);
  const targetMenuItem = event.key === "ArrowUp"
    ? currentMenuItem
    : menuItems[currentMenuItemIndex + 1];
  if (!targetMenuItem) return;

  event.preventDefault();
  event.stopPropagation();
  focusAttributeSelectorMenuItem(targetMenuItem);
};

/**
 * Helper for keyboard navigation in ProvenancePicker.
 * Sets the element in focus as the checkbox in a specific provenance option.
 */
export function focusCheckboxInProvenanceEntry(
  optionElement: HTMLSpanElement,
  provenance: string
) {
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
 * Handles selecting (or deselecting) a provenance option in a ProvenancePicker via a click,
 * taking into account keyboard navigation concerns.
 */
export function handleProvenanceEntryClick(
  event: ReactMouseEvent<HTMLSpanElement>,
  provenance: string,
  toggleProvenance: (provenance: string) => void,
) {
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
 * Used for keyboard navigation in ProvenancePicker.
 * When a provenance option is in focus, Enter or Space should toggle it.
 */
export function handleProvenanceEntryKeyDownEvent(
  event: ReactKeyboardEvent<HTMLSpanElement>,
  provenance: string,
  toggleProvenance: (provenance: string) => void,
) {
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
