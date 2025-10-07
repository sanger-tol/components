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
  console.log(conditionObj.and_?.sts_sample_sts_project_union?.in_list.value[0], Object.keys(conditionObj.and_ ?? {}).length === 0);
  if (Object.keys(conditionObj.and_ ?? {}).length === 0) return false;

  for (const [fieldSystemName, conditions] of Object.entries(conditionObj.and_!)) {
    let fieldValue = getFieldByName(dataObject, fieldSystemName);
    if (dataObject && fieldValue) {
      // normalize to array for easier processing
      fieldValue = Array.isArray(fieldValue) ? fieldValue : [fieldValue];
      for (const condition in conditions) {
        const conditionValue = conditions[condition].value;

        switch (condition) {
          case "contains":
            if (!fieldValue.some((v: any) => typeof v === 'string' && v.includes(conditionValue))) {
              return false;
            }
            break;
          case "eq":
            if (!fieldValue.some((v: any) => v === conditionValue)) {
              return false;
            }
            break;
          case "gt":
            if (!fieldValue.some((v: any) => v > conditionValue)) {
              return false;
            }
            break;
          case "gte":
            if (!fieldValue.some((v: any) => v >= conditionValue)) {
              return false;
            }
            break;
          case "lt":
            if (!fieldValue.some((v: any) => v < conditionValue)) {
              return false;
            }
            break;
          case "lte":
            if (!fieldValue.some((v: any) => v <= conditionValue)) {
              return false;
            }
            break;
          case "in_list":
            if (!fieldValue.some((v: any) => Array.isArray(conditionValue) && conditionValue.includes(v))) {
              return false;
            }
            break;
        }
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
