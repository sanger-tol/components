/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useMemo } from "react";
import countryList from "react-select-country-list";
import { SingleSelect, FormComponentWrapper, TFormCountrySelectField } from "..";

export interface PCountrySelect extends TFormCountrySelectField {
  name?: string;
  value: string;
  setValue: (value: string) => void;
  errorText?: string;
}

export function CountrySelect(props: PCountrySelect) {
  const {
    name,
    label,
    value,
    setValue,
    readOnly,
    placeholder = "Please Select...",
  } = props;

  const countryOptions = useMemo(() => countryList().getData(), []);
  const countryItems = countryOptions.map((item: any) => item.label);

  return (
    <FormComponentWrapper {...props} id={name} label={label || "Nationality:"}>
      <SingleSelect
        data={countryItems}
        placeholder={placeholder}
        value={value}
        onChange={setValue}
        readOnly={readOnly}
        block
      />
    </FormComponentWrapper>
  );
}
