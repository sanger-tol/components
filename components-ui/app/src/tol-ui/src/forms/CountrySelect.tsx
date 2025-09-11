/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useMemo } from "react";
import countryList from "react-select-country-list";
import {
  SingleSelect,
  RSForm,
  FormLabel,
  IFormLabelIcon
} from "..";

export interface PCountrySelect {
  label?: string;
  value: string;
  setValue: any;
  errorText?: string;
  icon?: IFormLabelIcon;
}

export function CountrySelect(props: PCountrySelect) {
  const { label, value, setValue, errorText, icon } = props;

  const countryOptions = useMemo(() => countryList().getData(), []);
  const countryItems = countryOptions.map((item: any) => item.label);

  return (
    <RSForm.Group controlId="formCountrySelector">
      <FormLabel label={label || "Nationality:"} icon={icon} />
      <SingleSelect
        data={countryItems}
        placeholder="Please Select..."
        value={value}
        setValue={setValue}
        block
      />
      <RSForm.ErrorMessage show={Boolean(errorText)} placement="bottomStart">{errorText}</RSForm.ErrorMessage>
    </RSForm.Group>
  );
}
