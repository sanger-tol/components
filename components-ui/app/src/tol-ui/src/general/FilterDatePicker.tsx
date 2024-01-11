/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { isEmptyObject, stopPropagation } from './Utils';
import { DateRangePicker } from 'rsuite';
import { FromAndTo } from "./Filter";
import { useEffectUpdate } from "../hooks/useEffectUpdate";


export interface Props {
  id: string,
  rename: string,
  filter: object,
  setFilter: Function // eslint-disable-line
}

function FilterDatePicker(props: Props) {
  const { id, rename, filter, setFilter } = props;
  const filterType: string = 'range';
  const [value, setValue] = useState<any>();

  // altering filter value if the attribute is filtered on else where
  useEffectUpdate(() => {
    if (filterType in filter && id in filter[filterType]) {
      // needs converting back to value state (how rsuite wants it)
      const filterValue = filterToValue(filter[filterType][id]);
      if (JSON.stringify(value) !== JSON.stringify(filterValue)) {
        setValue(filterValue);
      }
    } else {
      setValue(null);
    }
  }, [filter]);

  const filterToValue = (dateRange: FromAndTo) => {
    return [
      new Date(dateRange.from),
      new Date(dateRange.to)
    ];
  };

  const valueToFilter = (dateRange: string[]) => {
    const from = new Date(dateRange[0]);
    const to = new Date(dateRange[1]);
    // ensure a whole day is selected
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);
    return {
      from: from,
      to: to
    };
  };

  const onFilter = (input: string[]) => {
    // update date input value
    setValue(input);
    // input removed
    if (input === null) {
      delete filter[filterType][id];
      // delete filter type if object is empty
      if (isEmptyObject(filter[filterType])) {
        delete filter[filterType];
      }
    } else {
      // if filter type not created
      if (!(filterType in filter)) {
        filter[filterType] = {};
      }
      filter[filterType][id] = valueToFilter(input);
    }
    setFilter({...filter});
  };
  
  return (
    <span onClick={ stopPropagation }>
      <DateRangePicker
        block
        // @ts-ignore
        onChange={ onFilter }
        value={ value }
        placeholder={ rename }
        format="dd/MM/yyyy"
      />
    </span>
  );
}

export default FilterDatePicker;
