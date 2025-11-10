/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
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

export function getCellRendererPropValue(
  prop: string,
  value: string | IFilter,
  elementProps: Record<string, any>,
  dataObject: TDataObjectOrNull,
) {
  if (typeof value === "string" && value.includes("${")) {
    // replace placeholders with values from dataObject
    elementProps[prop] = value.replace(/\${(.*?)}/g, (_, key) =>
      getFieldByName(dataObject, key) || ""
    );
  } else if (typeof value === "object" && 'and_' in value) {
    elementProps[prop] = processConditionToBoolean(value, dataObject);
  } else {
    elementProps[prop] = value;
  }
}
