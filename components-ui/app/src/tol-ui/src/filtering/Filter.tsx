/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Zone } from "../board";
import FilterTextInput from "./FilterTextInput";
import FilterDatePicker from "./FilterDatePicker";
//import FilterBooleanPicker from "./FilterBooleanPicker";
//import { isEmptyObject } from "../general/Utils";


export type FilterType = 'str'|'int'|'float'|'datetime'|'boolean'|'multi'

export interface Filter {
  attribute: string,
  rename: string,
  type: FilterType,
  componentId: string,
  zone: Zone,
  setZone: any
}

function Filter(props: Filter) {
  switch(props.type) {
  case 'str':
  case 'int':
  case 'float':
    return (
      <FilterTextInput
        {...props}
      />
    );
  case 'datetime':
    return (
      <FilterDatePicker
        {...props}
      />
    );
  /*
  case 'boolean':
    return (
      <FilterBooleanPicker
        {...props}
      />
    );
  */
  }
  return <></>;
}

export default Filter;
