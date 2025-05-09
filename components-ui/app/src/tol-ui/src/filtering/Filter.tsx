/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { IZone } from "../models";
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

export interface Filter {
  attribute: string;
  rename: string;
  type?: IFilterInputType;
  componentId: string;
  zone: IZone;
  setZone: any;

  endpoint: string;
  baseUrl?: string;

  delay?: number;
}

function Filter(props: Filter) {
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
  console.log("Cannot retrieve filter type: " + props.attribute);
  return <></>;
}

export default Filter;
