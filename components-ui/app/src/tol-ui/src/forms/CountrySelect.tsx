/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useMemo } from "react";
import countryList from "react-select-country-list";
import {
  SingleSelect,
  RSForm
} from "..";

export interface PCountrySelect {
  label?: string;
  value: string;
  setValue: any;
  errorText?: string;
}

export function CountrySelect(props: PCountrySelect) {
  const { label, value, setValue, errorText } = props;

  const countryOptions = useMemo(() => countryList().getData(), []);
  const countryItems = countryOptions.map((item: any) => item.label);

  return (
    <RSForm.Group controlId="formCountrySelector">
      <RSForm.ControlLabel>{label ?? "Nationality:"}</RSForm.ControlLabel>
      <SingleSelect
        data={countryItems}
        placeholder="Please Select..."
        value={value}
        setValue={setValue}
        block
        errorText={errorText}
      />
      <RSForm.ErrorMessage show={Boolean(errorText)} placement="bottomStart">{errorText}</RSForm.ErrorMessage>
    </RSForm.Group>
  );
}
