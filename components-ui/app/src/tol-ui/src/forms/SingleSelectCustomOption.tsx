/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

/* 
Single select dropdown with option for another text field to show,
when 'other' is selected, allowing for custom response
*/

import { useState, useEffect } from "react";
import { RSForm } from "../index";
import { SingleSelect, FormTextField } from "./index";

interface Props {
  id: string;
  value: string;
  setValue: Function;
  data: string[];
  label?: string;
  customOptionPlaceholder?: string;
}

function SingleSelectCustomOption(props: Props) {
  const { id, value, setValue, data, label, customOptionPlaceholder } = props;

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
        <RSForm.ControlLabel>
          {label || "Please select from the dropdown below..."}
        </RSForm.ControlLabel>
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
      </RSForm.Group>
    </>
  );
}

export default SingleSelectCustomOption;
