/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from 'react';
import { DateRangePicker } from 'rsuite';
import { stopPropagation } from '../general/Utils';
import { Filter } from './Filter';
import { setFilter, filterListener } from './Utils';


function FilterDatePicker(props: Filter) {
  const { attribute, componentId, rename, zone, setZone } = props;
  const [value, setValue] = useState<any>();
  const [disabled, setDisabled] = useState(false);

  filterListener({
    attribute: attribute,
    componentId: componentId,
    operators: ['gte', 'lt'],
    zone: zone,
    setValue: setValue,
    setDisabled: setDisabled,
    emptyValue: null,
    zoneToValue: (filterValue: any, exisitingValue: any) => {
      if (exisitingValue === null) return filterValue; // first iteration
      return [exisitingValue, filterValue]; // second iteration
    }
  }, [zone]);

  const onFilter = (input: string[]) => {
    const from = input !== null ? new Date(input[0]) : null;
    const to = input !== null ? new Date(input[1]) : null;
    if (from !== null) from.setHours(0, 0, 0, 0);
    if (to !== null) to.setHours(23, 59, 59, 999);
    setValue(input);
    setFilter({
      operator: 'gte',
      value: from,
      negate: false,
      attribute: attribute,
      componentId: componentId,
      zone: zone,
      empty: null
    });
    setFilter({
      operator: 'lt',
      value: to,
      negate: false,
      attribute: attribute,
      componentId: componentId,
      zone: zone,
      empty: null
    });
    setZone({...zone});
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
        disabled={ disabled }
        preventOverflow
      />
    </span>
  );
}

export default FilterDatePicker;
