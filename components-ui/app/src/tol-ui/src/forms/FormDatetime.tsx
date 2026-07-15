/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { DatePicker } from "rsuite";
import { FormComponentWrapper, IDatetimeField } from "..";

export interface PFormDatetime extends Omit<IDatetimeField, "type"> {
  value: Date | string | null;
  onChange: (value: Date | null) => void;
  errorText?: string;
}

export function FormDatetime(props: PFormDatetime) {
  const {
    name,
    label = "Date/Time",
    value,
    onChange,
    placeholder = "Select date/time",
    hideMinutes = () => false,
    format = "dd-MM-yyyy HH:mm",
  } = props;

  return (
    <FormComponentWrapper
      {...props}
      id={name}
      label={label}
    >
      <DatePicker
        value={value ? new Date(value) : null}
        onChange={onChange}
        hideMinutes={hideMinutes}
        format={format}
        placeholder={placeholder}
        block
      />
    </FormComponentWrapper>
  );
}
