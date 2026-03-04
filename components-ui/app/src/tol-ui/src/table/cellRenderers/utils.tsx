/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  CELL_RENDERER_PROP_ATTRIBUTE,
  CELL_RENDERER_PROP_ATTRIBUTE_OBJECT_KEY,
  getFieldByName,
  IFilter,
  TDataObjectOrNull
} from "../..";

export function processConditionToBoolean(conditionObj: IFilter, dataObject: TDataObjectOrNull) {
  if (Object.keys(conditionObj.and_ ?? {}).length === 0) return false;
  for (const [fieldSystemName, conditions] of Object.entries(conditionObj.and_!)) {
    let fieldValue = getFieldByName(dataObject, fieldSystemName);
    if (dataObject && (fieldValue !== undefined && fieldValue !== null)) {
      // normalize to array for easier processing
      fieldValue = Array.isArray(fieldValue) ? fieldValue : [fieldValue];
      for (const [operator, condition] of Object.entries(conditions)) {
        let result = false;
        switch (operator) {
          case "exists":
            result = fieldValue.some((v: any) => v !== undefined && v !== null);
            break;
          case "contains":
            result = fieldValue.some((v: any) => typeof v === 'string' && v.includes(condition.value));
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
            result = fieldValue.some((v: any) => Array.isArray(condition.value) && condition.value.includes(v));
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
    // replace placeholders '${}' with values from dataObject
    elementProps[prop] = propValue.replace(CELL_RENDERER_PROP_ATTRIBUTE, (_, key) => {
      let newPropValue: any;

      const isList = key.includes('...');
      const keyWithoutSpread = key.replace('...', ''); // remove spread operator if present
      const fieldName = keyWithoutSpread.replace(CELL_RENDERER_PROP_ATTRIBUTE_OBJECT_KEY, '').trim();

      // If spread operator is used for this field, return the current value
      if (isList && fieldName === field) {
        newPropValue = value;
      } else {
        newPropValue = getFieldByName(dataObject, key) || "";
      }

      console.log(newPropValue, key, fieldName);

      // // Object key matching
      // const objectKeys: string[] = key.match(CELL_RENDERER_PROP_ATTRIBUTE_OBJECT_KEY) || [];
      // objectKeys.forEach((k) => {
      //   newPropValue = k
      //     .replace(CELL_RENDERER_PROP_ATTRIBUTE_OBJECT_KEY, (_, objectKey) => {
      //       return newPropValue?.[objectKey] ?? "";
      //     })
      //     .trim();
      // });

      return newPropValue.toString();
    });
  } else if (typeof propValue === "object" && 'and_' in propValue) {
    elementProps[prop] = processConditionToBoolean(propValue, dataObject);
  } else {
    elementProps[prop] = propValue;
  }
}
