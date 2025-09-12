/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

/* 
Single select dropdown with option for another text field to show,
when 'other' is selected, allowing for custom response
*/

import { useState, useEffect } from "react";
import {
  RSForm,
  SingleSelect,
  FormTextField,
  FormLabel,
  IFormLabelIcon,
} from "..";

export interface PSingleSelectCustomOption {
  id: string;
  value: string;
  setValue: Function;
  errorText?: string;
  data: string[];
  label?: string;
  customOptionPlaceholder?: string;
  icon?: IFormLabelIcon;
}

export function SingleSelectCustomOption(props: PSingleSelectCustomOption) {
  const {
    id,
    value,
    setValue,
    data,
    label,
    customOptionPlaceholder,
    errorText,
    icon,
  } = props;

  const [selectedOption, setSelectedOption] = useState("");
  const [customValue, setCustomValue] = useState("");
  const [showCustomBox, setShowCustomBox] = useState(false);

  useEffect(() => {
    if (!value && selectedOption !== "Other") {
      setSelectedOption("");
      setCustomValue("");
      setShowCustomBox(false);
    } else if (data.includes(value)) {
      setSelectedOption(value);
      setShowCustomBox(false);
      setCustomValue("");
    } else {
      setSelectedOption("Other");
      setCustomValue(value);
      setShowCustomBox(true);
    }
  }, [value, data]);

  const handleSelectChange = (newValue: string) => {
    setSelectedOption(newValue);
    if (newValue === "Other" || newValue === "other") {
      setShowCustomBox(true);
      if (!data.includes(value)) {
        setCustomValue(value);
      } else {
        setCustomValue("");
        setValue("");
      }
    } else {
      setShowCustomBox(false);
      setCustomValue("");
      setValue(newValue);
    }
  };

  const handleCustomValueChange = (newValue: string) => {
    setCustomValue(newValue);
    setValue(newValue);
  };

  return (
    <>
      <RSForm.Group
        controlId={`form${
          label ? label.replace(/\s+/, "") : "OtherOptionSelect"
        }`}
      >
        <FormLabel label={label || "Select an option:"} icon={icon} />
        <SingleSelect
          data={data}
          placeholder="Please Select..."
          value={selectedOption}
          setValue={handleSelectChange}
          block
        />
        {showCustomBox && (
          <FormTextField
            id={`form-${id}-custom-${label}`}
            name={`custom${label ? label.replace(/\s+/, "") : "FormTextField"}`}
            label={`Other ${label || "Option"}`}
            placeholder={`${
              customOptionPlaceholder || "Please enter a custom option..."
            }`}
            value={customValue}
            onChange={handleCustomValueChange}
          />
        )}
        <RSForm.ErrorMessage show={Boolean(errorText)} placement="bottomStart">
          {errorText}
        </RSForm.ErrorMessage>
      </RSForm.Group>
    </>
  );
}
