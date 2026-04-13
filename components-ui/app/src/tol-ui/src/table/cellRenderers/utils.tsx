/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  CELL_RENDERER_PROP_ATTRIBUTE,
  CELL_RENDERER_PROP_ATTRIBUTE_OBJECT_KEY,
  CELL_RENDERER_SPREAD_OPERATOR,
  getFieldByName,
  IFilter,
  TDataObjectOrNull,
} from "../..";

export function processConditionToBoolean(
  conditionObj: IFilter,
  dataObject: TDataObjectOrNull,
) {
  if (Object.keys(conditionObj.and_ ?? {}).length === 0) return false;
  for (const [fieldSystemName, conditions] of Object.entries(
    conditionObj.and_!,
  )) {
    let fieldValue = getFieldByName(dataObject, fieldSystemName);
    if (dataObject && fieldValue !== undefined && fieldValue !== null) {
      // normalize to array for easier processing
      fieldValue = Array.isArray(fieldValue) ? fieldValue : [fieldValue];
      for (const [operator, condition] of Object.entries(conditions)) {
        let result = false;
        switch (operator) {
          case "exists":
            result = fieldValue.some((v: any) => v !== undefined && v !== null);
            break;
          case "contains":
            result = fieldValue.some(
              (v: any) => typeof v === "string" && v.includes(condition.value),
            );
            break;
          case "eq":
            result = fieldValue.some((v: any) => v === condition.value);
            break;
          case "gt":
            result = fieldValue.some((v: any) => v > condition.value);
            break;
          case "gte":
            result = fieldValue.some((v: any) => v >= condition.value);
            break;
          case "lt":
            result = fieldValue.some((v: any) => v < condition.value);
            break;
          case "lte":
            result = fieldValue.some((v: any) => v <= condition.value);
            break;
          case "in_list":
            result = fieldValue.some(
              (v: any) =>
                Array.isArray(condition.value) && condition.value.includes(v),
            );
            break;
        }
        // Handle negate
        if (condition.negate) result = !result;
        if (!result) return false;
      }
    } else {
      return false;
    }
  }
  return true;
}

/**
 * Resolves nested object values by traversing bracket-notation keys left to right.
 * e.g. given value = { address: { city: "London" } } and keyPath = "field[address][city]",
 * returns "London". If the value is not an object, returns it unchanged.
 *
 * @param value - The object to traverse, or a primitive to return as-is
 * @param keyPath - A string containing bracket-notation keys, e.g. "field[address][city]"
 * @returns The resolved nested value, the original value if not an object, or "" if a key is not found
 */
export function resolveObjectKeys(value: any, keyPath: string): any {
  if (typeof value !== "object" || value === null) return value;
  for (const match of keyPath.matchAll(
    CELL_RENDERER_PROP_ATTRIBUTE_OBJECT_KEY,
  )) {
    const objectKey = match[0].slice(1, -1);
    value = value?.[objectKey];
    if (value === undefined || value === null) return "";
  }
  return value;
}

/**
 * Resolves a single template placeholder key to its corresponding field value.
 * Handles spread operators and nested object key access.
 *
 * @param key - The captured placeholder key from inside `${}`
 * @param field - The current field name being rendered
 * @param value - The current field value (used when spread operator matches)
 * @param dataObject - The data object to resolve field values from
 */
export function processTagsToValues(
  key: string,
  field: string,
  value: any,
  dataObject: TDataObjectOrNull,
): any {
  const isList = key.includes(CELL_RENDERER_SPREAD_OPERATOR);

  // remove spread operator if present - still includes object keys
  const keyWithoutSpread = key.replace(CELL_RENDERER_SPREAD_OPERATOR, "");

  // remove the attribute object key prefixes to get the actual field name
  const fieldName = keyWithoutSpread
    .replace(CELL_RENDERER_PROP_ATTRIBUTE_OBJECT_KEY, "")
    .trim();

  // If spread operator is used for this field, return the current value
  let newPropValue: any;
  if (isList && fieldName === field) {
    newPropValue = value;
  } else {
    newPropValue = getFieldByName(dataObject, fieldName) || "";
  }

  // If the key includes any object keys, retrieve the value
  return resolveObjectKeys(newPropValue, keyWithoutSpread);
}

/**
 * Processes and assigns a prop value to an elementProps object, handling template strings and conditional logic.
 *
 * @param field - The field name associated with the value
 * @param value - The original value of the field - might be 1 value from an array
 * @param prop - The property name to set on the elementProps object
 * @param propValue - The value to process, either a string (potentially with placeholders), a filter object, or a primitive
 * @param elementProps - The object to assign the processed value to
 * @param dataObject - The data object used to resolve placeholder values and evaluate conditions
 */
export function getCellRendererPropValue(
  field: string,
  value: any,
  prop: string,
  propValue: string | IFilter,
  elementProps: Record<string, any>,
  dataObject: TDataObjectOrNull,
) {
  if (typeof propValue === "string" && propValue.includes("${")) {
    // replace placeholders '${}' with values from a dataObject
    elementProps[prop] = propValue.replace(
      CELL_RENDERER_PROP_ATTRIBUTE,
      (_, key) => processTagsToValues(key, field, value, dataObject),
    );
  } else if (typeof propValue === "object" && "and_" in propValue) {
    elementProps[prop] = processConditionToBoolean(propValue, dataObject);
  } else {
    elementProps[prop] = propValue;
  }
}
