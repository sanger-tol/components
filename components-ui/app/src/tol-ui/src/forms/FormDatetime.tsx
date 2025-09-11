/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { DatePicker } from "rsuite";
import { FormLabel, IFormLabelIcon, RSForm } from "..";

export interface PFormDatetime {
  name: string;
  value: any;
  onChange: (value: any) => void;
  label?: string;
  helpText?: string;
  errorText?: string;
  placeholder?: string;
  hideMinutes?: (minute: number, date: Date) => boolean;
  format?: string;
  icon?: IFormLabelIcon;
}

export function FormDatetime(props: PFormDatetime) {
  const {
    name,
    label = "Date/Time",
    value,
    onChange,
    helpText,
    errorText,
    placeholder = "Select date/time",
    hideMinutes = () => false,
    format = "dd-MM-yyyy HH:mm",
    icon,
  } = props;

  return (
    <>
      <RSForm.Group controlId={name}>
        <FormLabel label={label} icon={icon} />
        <DatePicker
          value={value ? new Date(value) : null}
          onChange={onChange}
          hideMinutes={hideMinutes}
          format={format}
          placeholder={placeholder}
          block
        />
        {helpText && <RSForm.HelpText>{helpText}</RSForm.HelpText>}
        <RSForm.ErrorMessage show={Boolean(errorText)} placement="bottomStart">
          {errorText}
        </RSForm.ErrorMessage>
      </RSForm.Group>
    </>
  );
}
