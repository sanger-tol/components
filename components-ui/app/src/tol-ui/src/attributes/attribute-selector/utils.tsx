/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Schema } from "rsuite";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from "react";

import {
  getAllAttributeData,
  getAttributeDetail,
  getProvenanceFieldName,
  isProvenanceFieldOfAttribute,
  MESSAGE_TYPE,
  PopUpMessage
} from "../..";
import type {
  IEntityMeta,
  IFormComponent,
  IRuntimeFieldFunction,
  ListGetter,
  TDataObjectListOrNull,
} from "../..";

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
  renderFunction: (value: string) => React.JSX.Element,
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
function getCheckboxesInProvenancePicker(menuItem: HTMLElement) {
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
export function handleExpandButtonKeyDownEvent(
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

export async function fetchCustomFieldFunctions(configDataSource: ListGetter): Promise<IRuntimeFieldFunction[]> {
  return await configDataSource.getList({ objectType: "runtime_field_function" })
    .then((result: TDataObjectListOrNull) => {
      // The data source may return null records; omit them from the function list.
      return (result ?? []).flatMap((item) => {
        if (!item) {
          return [];
        }

        const params = (item.params ?? {}) as Record<
          string,
          { python_type: string; default_value?: unknown }
        >;

        // Convert the attributes to the format the UI expects
        // (an integer ID, camelCase instead of snake_case)
        return [{
          id: Number(item.id),
          name: item.name,
          params: Object.fromEntries(
            Object.entries(params).map(([param, details]) => [
              param,
              {
                pythonType: details.python_type,
                ...(details.default_value !== undefined && {
                  defaultValue: details.default_value,
                }),
              },
            ]),
          ),
        }];
      });
    })
    .catch((error: unknown) => {
      console.error("Error fetching runtime field functions:", error);
      PopUpMessage({
        type: MESSAGE_TYPE.ERROR,
        message: "Could not fetch custom field functions",
      });
      return [];
    });
}

export function convertCustomFieldPythonTypeToFormField(
  pythonType: string
): [Omit<IFormComponent, "name">, ReturnType<(typeof Schema.Types)[keyof typeof Schema.Types]>] {
  if (pythonType == "int") {
    return [
      { type: "text" },
      Schema.Types.NumberType().isRequired().isInteger(),
    ];
  } else {
    return [
      { type: "text" },
      Schema.Types.StringType().isRequired(),
    ];
  }
}
