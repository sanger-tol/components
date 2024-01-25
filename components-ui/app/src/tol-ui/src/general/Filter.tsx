/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import FilterTextInput from "./FilterTextInput";
import FilterDatePicker from "./FilterDatePicker";
import FilterBooleanPicker from "./FilterBooleanPicker";


export interface FromAndTo {
  from: string,
  to: string
}

export interface Range {
  [key: string]: FromAndTo
}

export interface ApiFilter {
  contains: object,
  exact: object,
  range: Range,
  in_list: object
}

export type FilterType = 'str'|'int'|'float'|'datetime'|'boolean'|'multi'

interface Props {
  id: string,
  rename: string,
  type: FilterType,
  filter: object,
  setFilter: any
}

function Filter(props: Props) {
  const { type } = props;
  switch(type) {
  case 'str':
  case 'int':
  case 'float':
    return (
      <FilterTextInput
        {...props}
        type={type}
      />
    );
  case 'datetime':
    return (
      <FilterDatePicker
        {...props}
      />
    );
  case 'boolean':
    return (
      <FilterBooleanPicker
        {...props}
      />
    );
  }
  return <></>;
}

export default Filter;
