/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { IRemoteTargetAndZone } from "../models";
import FilterTextInput from "./FilterTextInput";
import FilterDatePicker from "./FilterDatePicker";
import FilterMultiSelect from "./FilterMultiSelect";
import FilterBoolean from "./FilterBoolean";

export type IFilterInputType =
  | "str"
  | "int"
  | "float"
  | "datetime"
  | "boolean"
  | "multi";

export interface IFilterInput extends IRemoteTargetAndZone {
  attribute: string;
  rename: string;
  type?: IFilterInputType;
  componentId: string;
  delay?: number;
}

export function Filter(props: IFilterInput) {
  switch (props.type) {
    case "str":
    case "int":
    case "float":
      return <FilterTextInput {...props} />;
    case "datetime":
      return <FilterDatePicker {...props} />;
    case "boolean":
      return <FilterBoolean {...props} />;
    case "multi":
      return <FilterMultiSelect {...props} />;
  }
  console.warn("Cannot retrieve filter type: " + props.attribute);
  return <></>;
}
