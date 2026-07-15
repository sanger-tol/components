/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useMemo } from "react";
import countryList from "react-select-country-list";
import {
  SingleSelect,
  FormComponentWrapper,
  ICountryselectField,
} from "..";

export interface PCountrySelect
  extends Omit<ICountryselectField, "type" | "name"> {
  name?: string;
  value: string;
  setValue: (value: string) => void;
  errorText?: string;
}

export function CountrySelect(props: PCountrySelect) {
  const { name, label, value, setValue } = props;

  const countryOptions = useMemo(() => countryList().getData(), []);
  const countryItems = countryOptions.map((item: any) => item.label);

  return (
    <FormComponentWrapper {...props} id={name} label={label || "Nationality:"}>
      <SingleSelect
        data={countryItems}
        placeholder="Please Select..."
        value={value}
        onChange={setValue}
        block
      />
    </FormComponentWrapper>
  );
}
