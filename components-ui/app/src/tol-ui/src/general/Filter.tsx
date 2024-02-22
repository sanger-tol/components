/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import FilterTextInput from "./FilterTextInput";
import FilterDatePicker from "./FilterDatePicker";
import FilterBooleanPicker from "./FilterBooleanPicker";
import { isEmptyObject } from "./Utils";


function mergeFilterType(output: object, filterType: string, target?: object, source?: object) {
  const targetOut = (target !== undefined && filterType in target) ? target[filterType] : {};
  const sourceOut = (source !== undefined && filterType in source) ? source[filterType] : {};
  if (!isEmptyObject(targetOut) || !isEmptyObject(sourceOut)) {
    output[filterType] = Object.assign(targetOut, sourceOut);
  }
}

export function mergeFilters(target?: object, source?: object) {
  const output = {};
  mergeFilterType(output, 'exact', target, source);
  mergeFilterType(output, 'contains', target, source);
  mergeFilterType(output, 'range', target, source);
  mergeFilterType(output, 'in_list', target, source);
  mergeFilterType(output, 'and_', target, source);
  return output;
}

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
