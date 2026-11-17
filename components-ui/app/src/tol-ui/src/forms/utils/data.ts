/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type React from "react";
import type {
  IFieldMapping,
  IFormConfig,
  TFormField,
  TFormFieldPath,
  TFormValuePath,
} from "../..";

/**
 * Checks whether a field value counts as empty. `null`, `undefined`, `""` and
 * empty arrays are empty, and plain objects are empty when all their values are.
 * `false` and `0` count as filled in.
 *
 * @param value - The field value to check.
 * @returns Whether the value is empty.
 */
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
 * Checks whether a value is a non-array object.
 *
 * @param value - The value to check.
 * @returns `true` if the value is a non-null, non-array object.
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Reads a value from nested form data.
 *
 * @param value - The form data, or part of it, to read from.
 * @param path - Object keys and array indexes leading to the value.
 * @returns The value at `path`, or `undefined` if the path does not exist.
 */
export function getValueAtPath(
  value: unknown,
  path: TFormValuePath,
): unknown {
  return path.reduce<unknown>((current, segment) => {
    if (Array.isArray(current)) {
      return typeof segment === "number" ? current[segment] : undefined;
    }

    return isRecord(current) ? current[String(segment)] : undefined;
  }, value);
}

/**
 * Recursively copies `current` along `path`, replacing the value at the end.
 * Missing objects are created along the way; array segments must be indexes.
 *
 * @param current - The value at the current depth of the path.
 * @param path - The remaining object keys and array indexes.
 * @param value - The value to set at the end of the path.
 * @returns A copy of `current` containing the updated value.
 */
function updateValueAtPath(
  current: unknown,
  path: TFormValuePath,
  value: unknown,
): unknown {
  if (path.length === 0) {
    return value;
  }

  const [segment, ...remainingPath] = path;

  if (Array.isArray(current)) {
    if (
      typeof segment !== "number" ||
      !Number.isInteger(segment) ||
      segment < 0
    ) {
      throw new TypeError("Array paths must use non-negative integer indexes.");
    }

    const updated = [...current];
    updated[segment] = updateValueAtPath(
      current[segment],
      remainingPath,
      value,
    );
    return updated;
  }

  const source = isRecord(current) ? current : {};
  const key = String(segment);

  return {
    ...source,
    [key]: updateValueAtPath(source[key], remainingPath, value),
  };
}

/**
 * Sets a value in nested form data without mutating the original.
 *
 * @param data - The top-level form data.
 * @param path - The field name, followed by any nested keys and array indexes.
 * @param value - The value to set.
 * @returns A copy of `data` containing the updated value.
 */
export function setValueAtPath(
  data: Record<string, unknown>,
  path: TFormFieldPath,
  value: unknown,
): Record<string, unknown> {
  const [fieldName, ...remainingPath] = path;
  const nextFieldValue = updateValueAtPath(
    data[fieldName],
    remainingPath,
    value,
  );

  return {
    ...data,
    [fieldName]: nextFieldValue,
  };
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
 * of the fallback default. Subform fields are initialized recursively, keeping
 * multiple subforms as arrays of objects.
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
    const existing = data?.[field.name];

    if (field.type === "toggle") {
      initialData[field.name] =
        typeof existing === "boolean"
          ? existing
          : (field.defaultChecked ?? false);
    } else if (field.type === "checkbox") {
      // CheckboxGroup always requires an array value, so non-array DB values
      // (e.g. a boolean flag) must not be passed through as-is.
      initialData[field.name] = Array.isArray(existing)
        ? existing
        : existing === undefined && field.defaultChecked
          ? field.defaultChecked
          : [];
    } else if (field.type === "multipleselect" || field.type === "tag") {
      initialData[field.name] = Array.isArray(existing) ? existing : [];
    } else if (field.type === "subform") {
      const createSubformData = (value: unknown) => {
        const sourceData = isRecord(value) ? value : undefined;

        return createInitialDataSnapshot({ fields: field.fields }, sourceData);
      };

      if (field.multiple) {
        initialData[field.name] = Array.isArray(existing)
          ? existing.map(createSubformData)
          : [];
      } else {
        initialData[field.name] = createSubformData(existing);
      }
    } else if (field.multiple) {
      initialData[field.name] = existing || {};
    } else {
      initialData[field.name] = existing || "";
    }
  });
  return initialData;
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
 * Counts the leaf fields of a subform, including those of nested subforms.
 *
 * @param fields - The subform's fields.
 * @returns The number of editable leaf fields.
 */
export function countSubformFields(fields: TFormField[]): number {
  return fields.reduce(
    (count, field) =>
      count + (field.type === "subform" ? countSubformFields(field.fields) : 1),
    0,
  );
}
