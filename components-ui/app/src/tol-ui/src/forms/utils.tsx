/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from "react";
import { Message, Toaster } from "rsuite";
import { IFieldMapping, IFormConfig, MISSING_DATA_ERROR } from "..";

/**
 * Displays an error toast with the provided message
 *
 * @param message - The message to display
 * @param toaster - The component managing the toast stack
 */
export function pushErrorMessage(message: string, toaster: Toaster) {
  toaster.push(<Message children={message} type="error" showIcon={true} />, {
    duration: 4000,
  });
}

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
export function setInitialData(
  formConfig: IFormConfig,
  setFormData: React.Dispatch<React.SetStateAction<object>>,
  data?: any,
) {
  setFormData(() => {
    const initialData = {};
    formConfig.fields.forEach((field: any) => {
      if (field.type === "checkbox" && field.defaultChecked) {
        initialData[field.name] = field.defaultChecked;
      } else if (field.multiple) {
        initialData[field.name] = data[field.name] || {};
      } else {
        initialData[field.name] = data[field.name] || "";
      }
    });
    return initialData;
  });
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
export function validateForm(
  formRef: React.RefObject<any>,
  toaster: Toaster,
  formData: object,
  onSubmit?: (formData: object, isValid: boolean) => void,
): boolean {
  if (!formRef.current || !formRef.current.check()) {
    pushErrorMessage(MISSING_DATA_ERROR, toaster);
    return false;
  } else {
    if (onSubmit) {
      onSubmit(formData, true);
    }
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
    if (data[targetField]) continue; // Don't overwrite existing target values

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

export function createNewInput(
  fieldName: string,
  formData: object,
  setFormData: React.Dispatch<React.SetStateAction<object>>,
  setModifiedFields?: React.Dispatch<React.SetStateAction<object>>,
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
  if (setModifiedFields) {
    setModifiedFields((prev) => ({
      ...prev,
      [fieldName]: updatedFormData[fieldName],
    }));
  }
}
