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
} from "..";

/**
 * Sets the initial data in a form to `data`
 *
 * @remarks
 * Designed for the `FormAllInOne` component.
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
    if (field.type === "checkbox" && field.defaultChecked) {
      initialData[field.name] = field.defaultChecked;
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
