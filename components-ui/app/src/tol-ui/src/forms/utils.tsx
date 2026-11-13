/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from "react";
import {
  IFieldMapping,
  IFormConfig,
  MESSAGE_TYPE,
  MISSING_DATA_ERROR,
  PopUpMessage,
  TFormField,
  DEFAULT_FORM_SCROLL_NAV_KEY,
  SECTION_QUERY_PARAM,
  SUB_SECTION_QUERY_PARAM,
  UNDEFINED_FORM_SECTION_IDENTIFIER,
  normaliseCaps,
} from "..";
import type {
  IFormScrollNavConfig,
  IFormSection,
  IScrollNavGroup,
  IScrollNavItem,
} from "..";

export function isEmptyFieldValue(value: unknown): boolean {
  if (value === undefined || value === null || value === "") {
    return true;
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  if (
    typeof value === "object" &&
    Object.getPrototypeOf(value) === Object.prototype
  ) {
    return Object.values(value).every(isEmptyFieldValue);
  }
  return false;
}

/**
 * Sets the initial data in a form to `data`
 *
 * @param formConfig - The form config object used to define the form
 * @param setFormData - The state setter for a form data state
 * @param data - The data to be set as the initial data
 */
export function setInitialData<T>(
  formConfig: IFormConfig,
  setFormData: React.Dispatch<React.SetStateAction<T>>,
  data?: T,
) {
  setFormData(createInitialDataSnapshot<T>(formConfig, data) as T);
}

/**
 * Builds the initial form state object from a form configuration and optional source data.
 * If source `data` contains a value for a field name, that value is used instead
 * of the fallback default.
 *
 * @param formConfig - Form configuration containing the fields to initialize.
 * @param data - Optional source object used to pre-fill field values.
 * @returns A name-keyed object containing normalized initial field values.
 */
export function createInitialDataSnapshot<T>(
  formConfig: IFormConfig,
  data?: T,
): Record<string, any> {
  const initialData: Record<string, any> = {};
  formConfig.fields.forEach((field: TFormField) => {
    if (field.type === "checkbox") {
      // CheckboxGroup always requires an array value, so non-array DB values
      // (e.g. a boolean flag) must not be passed through as-is.
      const existing = data?.[field.name];
      initialData[field.name] = Array.isArray(existing)
        ? existing
        : existing === undefined && field.defaultChecked
          ? field.defaultChecked
          : [];
    } else if (field.multiple) {
      initialData[field.name] = data?.[field.name] || {};
    } else {
      initialData[field.name] = data?.[field.name] || "";
    }
  });
  return initialData;
}

/**
 * Validates data of a form. If valid, `onSubmit` is run. If not, an error toast is shown.
 *
 * @param formRef - React ref to the target form
 * @param toaster - The toaster component to display the error toast
 * @param formData - The form data to validate
 * @param onSubmit - Runs if the form is valid
 * @returns A boolean describing whether or not the form was valid
 */
export function validateForm<T>(
  formRef: React.RefObject<any>,
  formData: T,
  onSubmit?: (formData: T, isValid: boolean) => void,
): boolean {
  if (!formRef.current || !formRef.current.check()) {
    PopUpMessage({
      message: MISSING_DATA_ERROR,
      type: MESSAGE_TYPE.ERROR,
    });
    return false;
  } else {
    onSubmit?.(formData, true);
    return true;
  }
}

/**
 * Applies a list of field mappings to `data`, pre-filling target fields from a
 * source field when the optional condition passes and the target is currently empty.
 * Only populates a target field when it has no existing value, so returning users
 * with data already saved are never overwritten.
 *
 * @param data - The current form data object.
 * @param mappings - Array of `IFieldMapping` rules to apply.
 * @returns `mappedData` — a shallow copy of `data` with any matched targets filled in,
 *   and `readOnlyFields` — the names of fields that were populated by a mapping
 *   (and should therefore be locked read-only in the form config).
 */
export function applyFieldMappings<T extends Record<string, any>>(
  data: T,
  mappings: IFieldMapping[],
): { mappedData: T; readOnlyFields: string[] } {
  const mappedData = { ...data };
  const readOnlyFields: string[] = [];

  for (const {
    sourceField,
    targetField,
    condition,
    transform,
    readOnlyWhenMapped = true,
  } of mappings) {
    const sourceValue = data[sourceField];
    if (!sourceValue) continue;
    if (condition && !condition(sourceValue)) continue;
    if (data[targetField]) continue;

    mappedData[targetField as keyof T] = (
      transform ? transform(sourceValue) : sourceValue
    ) as T[keyof T];
    if (readOnlyWhenMapped) readOnlyFields.push(targetField);
  }

  return { mappedData, readOnlyFields };
}

/**
 * Returns a new form config with `readOnly: true` applied to any field whose
 * `name` appears in `fields`. Fields not in the list are left unchanged.
 *
 * @param config - The source `IFormConfig` to patch.
 * @param fields - Field names that should be marked read-only.
 */
export function applyReadOnlyFields(
  config: IFormConfig,
  fields: string[],
): IFormConfig {
  if (fields.length === 0) return config;
  return {
    ...config,
    fields: config.fields.map((field: any) =>
      fields.includes(field.name) ? { ...field, readOnly: true } : field,
    ),
  };
}

/**
 * Appends a new empty keyed input under a multi-input field and updates form state.
 *
 * When `setModifiedFields` is provided, the same nested field update is mirrored
 * into the modified-fields state.
 *
 * @param fieldName - Name of the top-level form field holding dynamic nested inputs.
 * @param formData - Current form data object.
 * @param setFormData - State setter for form data.
 * @param setModifiedFields - Optional state setter for tracking modified fields.
 */
export function createNewInput<T>(
  fieldName: string,
  formData: T,
  setFormData: React.Dispatch<React.SetStateAction<T>>,
  setModifiedFields?: React.Dispatch<React.SetStateAction<T>>,
) {
  const newInput = `${fieldName}${Math.floor(Math.random() * 900) + 100}`;
  const updatedFormData = {
    ...formData,
    [fieldName]: {
      ...formData[fieldName],
      [newInput]: "",
    },
  };
  setFormData(updatedFormData);
  setModifiedFields?.((prev) => ({
    ...prev,
    [fieldName]: updatedFormData[fieldName],
  }));
}

/**
 * Strips colons and surrounding whitespace from a label.
 *
 * @param value - The raw label.
 * @returns The cleaned label.
 */
export function cleanTitle(value: string): string {
  return value.replace(/:/g, "").trim();
}

/**
 * Converts a snake_case key into a human-readable, title-cased label.
 *
 * @param value - The raw key (e.g. `assembly_metrics`).
 * @returns The prettified label (e.g. `Assembly Metrics`).
 */
export function prettify(value: string): string {
  return cleanTitle(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Builds the DOM anchor id for a field when a form uses scroll navigation.
 *
 * @param formKey - The scroll-nav key of the form.
 * @param subSection - The sub-section the field belongs to.
 * @param name - The field's name.
 * @param index - The field's index within the form config.
 * @returns The composed anchor id (e.g. `tol-form-metadata-general-doi-0`).
 */
export function getFieldAnchorId(
  formKey: string,
  subSection: string,
  name: string,
  index: number,
): string {
  return `tol-form-${formKey}-${subSection}-${name}-${index}`;
}

/**
 * Builds the DOM id for a form's scroll container.
 *
 * @param formKey - The scroll-nav key of the form.
 * @returns The scroll container id (e.g. `tol-form-scroll-metadata`).
 */
export function getScrollContainerId(formKey: string): string {
  return `tol-form-scroll-${formKey}`;
}

/**
 * Normalises the `scrollNav` form option into a full config, or `undefined`
 * when scroll navigation is disabled.
 *
 * @param scrollNav - The raw `formConfig.options.scrollNav` value.
 * @returns The resolved config with defaults applied.
 */
export function resolveScrollNavConfig(
  scrollNav?: boolean | IFormScrollNavConfig,
) {
  if (!scrollNav) return undefined;
  const config = scrollNav === true ? {} : scrollNav;
  if (config.enabled === false) return undefined;
  return {
    ...config,
    key: config.key ?? DEFAULT_FORM_SCROLL_NAV_KEY,
    active: config.active ?? true,
    syncUrl: config.syncUrl ?? true,
    sectionParam: config.sectionParam ?? SECTION_QUERY_PARAM,
    subSectionParam: config.subSectionParam ?? SUB_SECTION_QUERY_PARAM,
  };
}

/**
 * Gives every field an anchor id so scroll navigation can target it. Fields
 * with an explicit `id` keep it.
 *
 * @param fields - The form fields.
 * @param formKey - The scroll-nav key of the form.
 * @returns The fields with an `id` set.
 */
export function withFieldAnchorIds(
  fields: TFormField[],
  formKey: string,
): TFormField[] {
  return fields.map((field, index) => ({
    ...field,
    id:
      field.id ??
      getFieldAnchorId(
        formKey,
        field.section ?? UNDEFINED_FORM_SECTION_IDENTIFIER,
        field.name,
        index,
      ),
  }));
}

/**
 * Groups fields by their `section` (sub-section) in render order: sections in
 * order of first appearance, then fields without a section last.
 *
 * @param fields - The form fields, with anchor ids applied.
 * @param sections - Optional section metadata used for labels.
 * @returns The sub-section groups with their ordered fields.
 */
export function getNavGroups(
  fields: TFormField[],
  sections: IFormSection[] = [],
): IScrollNavGroup[] {
  const sectionLabels = new Map(
    sections.map((section) => [section.id, section.label]),
  );
  const groups = new Map<string, IScrollNavGroup>();
  const miscFields: IScrollNavGroup["fields"] = [];

  fields.forEach((field, index) => {
    const navField = {
      anchorId: field.id ?? field.name,
      label: cleanTitle(field.label ?? prettify(field.name)),
      name: field.name,
      index,
    };
    if (!field.section) {
      miscFields.push(navField);
      return;
    }
    if (!groups.has(field.section)) {
      groups.set(field.section, {
        subSection: field.section,
        label: sectionLabels.get(field.section) ?? normaliseCaps(field.section),
        fields: [],
      });
    }
    groups.get(field.section)!.fields.push(navField);
  });

  const orderedGroups = Array.from(groups.values());
  if (miscFields.length) {
    orderedGroups.push({
      subSection: UNDEFINED_FORM_SECTION_IDENTIFIER,
      label: normaliseCaps("Misc"),
      fields: miscFields,
    });
  }
  return orderedGroups;
}

/**
 * Flattens nav groups into DOM-ordered nav items.
 *
 * @param groups - The nav groups.
 * @returns The flattened nav items.
 */
export function getNavItems(groups: IScrollNavGroup[]): IScrollNavItem[] {
  return groups.flatMap((group) =>
    group.fields.map(({ anchorId, name, index }) => ({
      anchorId,
      subSection: group.subSection,
      field: name,
      index,
    })),
  );
}

/**
 * Looks up a scroll container element in the DOM.
 *
 * @param containerId - The container's DOM id.
 * @returns The container element, or `null` if it is not mounted.
 */
export function findScrollContainer(
  containerId: string,
): HTMLDivElement | null {
  return document.getElementById(containerId) as HTMLDivElement | null;
}

/**
 * Computes the scroll-spy activation offset for a container: a quarter of its
 * visible height, capped at 120px.
 *
 * @param container - The scroll container.
 * @returns The offset in pixels.
 */
export function getScrollSpyOffset(container: HTMLDivElement): number {
  return Math.min(container.clientHeight * 0.25, 120);
}

export interface IFieldStatusContext {
  formLocked: boolean;
  sectionLocked: boolean;
  error?: string;
}

export type TFieldNavStatus =
  | "auto"
  | "locked"
  | "error"
  | "required"
  | "complete"
  | "recommended"
  | "none";

export function getFieldStatus(
  field: TFormField,
  value: unknown,
  ctx: IFieldStatusContext,
): TFieldNavStatus {
  if (field.automatic) return "auto";
  if (ctx.formLocked || ctx.sectionLocked || field.readOnly) return "locked";
  if (ctx.error) return "error";

  const empty = isEmptyFieldValue(value);

  if ((field.required || field.minOne) && empty) return "required";
  if (!empty) return "complete";

  return field.recommended ? "recommended" : "none";
}

//TODO
//TODO
