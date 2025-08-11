/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { DatePicker } from "rsuite";
import { RSForm } from "..";

export interface PFormDatetime {
  name: string;
  value: any;
  onChange: (value: any) => void;
  label?: string;
  helpText?: string;
  placeholder?: string;
  hideMinutes?: boolean;
  format?: string;
}

export function FormDatetime(props: PFormDatetime) {
  const {
    name,
    label = "Date/Time",
    value,
    onChange,
    helpText,
    placeholder = "Select date/time",
    hideMinutes = false,
    format = "dd-MM-yyyy HH:mm",
  } = props;

  return (
    <>
      <RSForm.Group controlId={name}>
        <RSForm.ControlLabel>{label}</RSForm.ControlLabel>
        <DatePicker
          value={value ? new Date(value) : null}
          onChange={onChange}
          hideMinutes={hideMinutes}
          format={format}
          placeholder={placeholder}
          block
        />
        {helpText && <RSForm.HelpText>{helpText}</RSForm.HelpText>}
      </RSForm.Group>
    </>
  );
}
