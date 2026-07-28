/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { DateRangePicker } from "rsuite";
import {
  stopPropagation,
  IFilterInput,
  TFilterDateRangeValue,
  setFilterInput,
  filterListener,
  FilterToggle,
  getIncomingDateBounds,
  shouldDisableDateOutsideBounds,
} from "..";


export function FilterDatePicker(props: IFilterInput) {
  const { attribute, componentId, rename, zone, setZone } = props;
  const [value, setValue] = useState<TFilterDateRangeValue>(null);
  const [disabled, setDisabled] = useState(false);
  const [exists, setExists] = useState<boolean>(false);
  const [negate, setNegate] = useState<boolean>(false);

  // Get the min and max date bounds for the date picker based on the incoming filter values
  const disabledBounds = getIncomingDateBounds(attribute, componentId, zone);

  filterListener({
    attribute: attribute,
    componentId: componentId,
    operators: ["gte", "lt"],
    zone: zone,
    setValue: setValue,
    setExists: setExists,
    setNegate: setNegate,
    setDisabled: setDisabled,
    emptyValue: null,
    zoneToValue: (filterValue: any, existingValue: TFilterDateRangeValue) => {
      const nextDate =
        filterValue instanceof Date ? new Date(filterValue) : new Date(String(filterValue));
      if (Number.isNaN(nextDate.getTime())) return existingValue;
      if (existingValue === null) return [nextDate, nextDate];
      return [existingValue[0], nextDate];
    },
    onlyUpdateMyValues: true,
  });

  const onFilter = (input: TFilterDateRangeValue) => {
    const from = input !== null ? new Date(input[0]) : null;
    const to = input !== null ? new Date(input[1]) : null;
    if (from !== null) from.setHours(0, 0, 0, 0);
    if (to !== null) to.setHours(23, 59, 59, 999);
    setValue(input);
    setFilterInput({
      operator: "gte",
      value: from,
      negate: negate,
      attribute: attribute,
      componentId: componentId,
      zone: zone,
      hasValue: from !== null,
    });
    setFilterInput({
      operator: "lt",
      value: to,
      negate: negate,
      attribute: attribute,
      componentId: componentId,
      zone: zone,
      hasValue: to !== null,
    });
    setZone({ ...zone });
  };

  const onExists = (ex: boolean) => {
    setExists(!ex);
    setValue(null);
    setFilterInput({
      operator: "exists",
      negate: negate,
      exists: !ex,
      attribute: attribute,
      componentId: componentId,
      zone: zone,
    });
    setZone({ ...zone });
  };

  const onNegate = (ng: boolean) => {
    const from = value !== null ? new Date(value[0]) : null;
    const to = value !== null ? new Date(value[1]) : null;
    if (from !== null) from.setHours(0, 0, 0, 0);
    if (to !== null) to.setHours(23, 59, 59, 999);
    setNegate(!ng);
    setFilterInput({
      operator: exists ? "exists" : "gte",
      value: from,
      negate: !ng,
      exists: exists,
      attribute: attribute,
      componentId: componentId,
      zone: zone,
      hasValue: from !== null,
    });
    setFilterInput({
      operator: exists ? "exists" : "lt",
      value: to,
      negate: !ng,
      exists: exists,
      attribute: attribute,
      componentId: componentId,
      zone: zone,
      hasValue: to !== null,
    });
    setZone({ ...zone });
  };

  return (
    <div className="tol-date-filter" onClick={stopPropagation}>
      <DateRangePicker
        block
        onChange={onFilter}
        value={value}
        placeholder={rename}
        format="dd/MM/yyyy"
        shouldDisableDate={(date) => shouldDisableDateOutsideBounds(date, disabledBounds)}
        preventOverflow
      />
      <FilterToggle
        negate={negate}
        onNegate={onNegate}
        exists={exists}
        onExists={onExists}
        disabled={disabled}
        hasValue={value !== null && value !== undefined}
      />
    </div>
  );
}
