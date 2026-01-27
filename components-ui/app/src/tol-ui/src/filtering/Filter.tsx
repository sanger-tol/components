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
  | "float"
  | "datetime"
  | "bool"
  | "multi";

export interface IFilterInput extends IRemoteTargetAndZone, IFilterInputBase {}

export interface IFilterInputBase {
  attribute: string;
  rename: string;
  componentId: string;
  type?: IFilterInputType;
  delay?: number;
}

export interface IFilterBlockFilters {
  order: string[];
  attributes: {
    [attributeName: string]: IFilterInputBase;
  };
}

export function Filter(props: IFilterInput) {
  switch (props.type) {
    case "str":
    case "int":
    case "float":
      return <FilterTextInput {...props} />;
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
