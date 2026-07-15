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
  SingleSelect,
  FormTextField,
  FormComponentWrapper,
  ISingleselectcustomoptionField,
} from "..";

export interface PSingleSelectCustomOption
  extends Omit<ISingleselectcustomoptionField, "type"> {
  id: string;
  value: string;
  setValue: (value: string) => void;
  errorText?: string;
}

export function SingleSelectCustomOption(props: PSingleSelectCustomOption) {
  const {
    id,
    name,
    value,
    setValue,
    data,
    label,
    customOptionPlaceholder,
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
    <FormComponentWrapper {...props} label={label || "Select an option:"}>
        <SingleSelect
          data={data}
          placeholder="Please Select..."
          value={selectedOption}
          onChange={handleSelectChange}
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
    </FormComponentWrapper>
  );
}
