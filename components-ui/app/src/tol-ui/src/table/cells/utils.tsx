/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  getFieldByName,
  IFilter,
  TDataObjectOrNull
} from "../..";


export function processFilterToBoolean(filterObj: any, dataObject: TDataObjectOrNull) {
  for (const fieldName in filterObj.and_) {
    const fieldValue = getFieldByName(dataObject, fieldName)
    for (const condition in filterObj.and_[fieldName]) {
      if (dataObject && fieldValue) {
        switch (condition) {
          case "contains":
            if (!(typeof fieldValue === 'string' && fieldValue.includes(filterObj.and_[fieldName][condition].value))) {
              return false;
            }
            break;
          case "eq":
            if (!(fieldValue == (filterObj.and_[fieldName][condition].value))) {
              return false;
            }
            break;
          case "gt":
            if (!(fieldValue > (filterObj.and_[fieldName][condition].value))) {
              return false;
            }
            break;
          case "gte":
            if (!(fieldValue >= (filterObj.and_[fieldName][condition].value))) {
              return false;
            }
            break;
          case "lt":
            if (!(fieldValue < (filterObj.and_[fieldName][condition].value))) {
              return false;
            }
            break;
          case "lte":
            if (!(fieldValue <= (filterObj.and_[fieldName][condition].value))) {
              return false;
            }
            break;
          case "in_list":
            if (!((filterObj.and_[fieldName][condition].value).includes(fieldValue))) {
              return false;
            }
            break;
        }
      } else {
        return false;
      }
    }
  }

  return true;
}

export function getCellRendererValue(
    elementProps: Record<string, any>,
    value: string | IFilter,
    dataObject: TDataObjectOrNull,
    prop: string
) {
    if (typeof value === "string" && value.includes("${")) {
        // replace placeholders with values from dataObject
        elementProps[prop] = value.replace(/\${(.*?)}/g, (_, key) =>
            getFieldByName(dataObject, key) || ""
        );
        // Checks for filter object as prop
    } else if (typeof value === "object" && 'and_' in value) {
        elementProps[prop] = processFilterToBoolean(value, dataObject);
    } else {
        elementProps[prop] = value;
    }
}