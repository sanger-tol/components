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
  console.log(conditionObj.and_?.sts_sample_sts_project_union?.in_list.value[0], Object.keys(conditionObj.and_ ?? {}).length);
  if (Object.keys(conditionObj.and_ ?? {}).length === 0) return false;

  for (const [fieldSystemName, conditions] of Object.entries(conditionObj.and_!)) {
    let fieldValue = getFieldByName(dataObject, fieldSystemName);
    console.log({dataObject, fieldValue, fieldSystemName});
    if (dataObject && fieldValue) {
      // normalize to array for easier processing
      fieldValue = Array.isArray(fieldValue) ? fieldValue : [fieldValue];
      for (const condition in conditions) {
        const conditionValue = conditions[condition].value;

        switch (condition) {
          case "contains":
            if (!fieldValue.some((v: any) => typeof v === 'string' && v.includes(conditionValue))) {
              console.log(false, 1);
              return false;
            }
            break;
          case "eq":
            if (!fieldValue.some((v: any) => v === conditionValue)) {
              console.log(false, 2);
              return false;
            }
            break;
          case "gt":
            if (!fieldValue.some((v: any) => v > conditionValue)) {
              console.log(false, 3);
              return false;
            }
            break;
          case "gte":
            if (!fieldValue.some((v: any) => v >= conditionValue)) {
              console.log(false, 4);
              return false;
            }
            break;
          case "lt":
            if (!fieldValue.some((v: any) => v < conditionValue)) {
              console.log(false, 5);
              return false;
            }
            break;
          case "lte":
            if (!fieldValue.some((v: any) => v <= conditionValue)) {
              console.log(false, 6);
              return false;
            }
            break;
          case "in_list":
            if (!fieldValue.some((v: any) => Array.isArray(conditionValue) && conditionValue.includes(v))) {
              console.log(false, 7);
              return false;
            }
            break;
        }
      }
    } else {
      console.log(false, 8);
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
  console.log('inner hello')
  if (typeof value === "string" && value.includes("${")) {
    // replace placeholders with values from dataObject
    elementProps[prop] = value.replace(/\${(.*?)}/g, (_, key) =>
      getFieldByName(dataObject, key) || ""
    );
  } else if (typeof value === "object" && 'and_' in value) {
    console.log({h: 'y', value, dataObject});
    const x = processConditionToBoolean(value, dataObject);
    console.log('output', x);
    elementProps[prop] = x;
  } else {
    elementProps[prop] = value;
  }
}
