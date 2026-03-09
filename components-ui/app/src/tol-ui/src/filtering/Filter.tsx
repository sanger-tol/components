/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  IRemoteTargetAndZone,
  FilterTextInput,
  FilterDatePicker,
  FilterMultiSelect,
  FilterBoolean,
} from "..";


export type IFilterInputType =
  | "str"
  | "int"
  | "double"
  | "float"
  | "datetime"
  | "bool"
  | "multi";

export interface IFilterInput extends IRemoteTargetAndZone {
  attribute: string;
  rename: string;
  componentId: string;
  type?: IFilterInputType;
  delay?: number;
}

export function Filter(props: IFilterInput) {
  switch (props.type) {
    case "str":
      return <FilterTextInput {...props} />;
    case "int":
    case "double":
    case "float":
      return <FilterTextInput isNumber {...props} />;
    case "datetime":
      return <FilterDatePicker {...props} />;
    case "bool":
      return <FilterBoolean {...props} />;
    case "multi":
      return <FilterMultiSelect {...props} />;
  }
  console.warn("Cannot retrieve filter type: " + props.attribute);
  return <></>;
}
