/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useMemo } from "react";
import { RSForm } from "../index";
import countryList from "react-select-country-list";
import { SingleSelect } from "./index";

interface Props {
  label?: string;
  value: string;
  setValue: any;
}

export function CountrySelect(props: Props) {
  const { label, value, setValue } = props;

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
      />
    </RSForm.Group>
  );
}
