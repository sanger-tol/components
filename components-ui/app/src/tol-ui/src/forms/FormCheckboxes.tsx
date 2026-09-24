/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Checkbox, CheckboxGroup } from "rsuite";
import { FormComponentWrapper, TFormCheckboxFields } from "..";
import { useEffect, useState } from "react";

export interface PFormCheckboxes extends TFormCheckboxFields {
  id: string;
  errorText?: string;
  checkedItems: string[];
  setCheckedItems: (value: string[]) => void;
  defaultChecked?: string[];
}

export function FormCheckboxes(props: PFormCheckboxes) {
  const {
    id,
    checkboxConfig,
    inline,
    indeterminate,
    hidden,
    defaultChecked = [],
    checkedItems,
    setCheckedItems,
  } = props;

  const [currentCheckedItems, setCurrentCheckedItems] = useState(
    defaultChecked === undefined ? checkedItems : defaultChecked,
  );

  useEffect(() => {
    if (defaultChecked === undefined) {
      setCurrentCheckedItems(checkedItems);
    }
  }, [checkedItems, defaultChecked]);

  const handleCheckboxChange = (value: string) => {
    const updatedCheckedItems = currentCheckedItems.includes(value)
      ? currentCheckedItems.filter((item: string) => item !== value)
      : [...currentCheckedItems, value];
    setCurrentCheckedItems(updatedCheckedItems);
    setCheckedItems(updatedCheckedItems);
  };

  return (
    <div style={{ display: hidden ? "none" : "block" }}>
      <FormComponentWrapper {...props}>
        <CheckboxGroup
          id={id}
          name={`${id}-checkbox-group`}
          value={currentCheckedItems}
          inline={inline}
        >
          {checkboxConfig.fields.map((field, index) => (
            <div key={index} style={field.style}>
              <Checkbox
                key={index}
                value={field.value}
                indeterminate={indeterminate}
                name={`checkbox${index}`}
                defaultChecked={field.defaultChecked}
                disabled={field.disabled}
                onChange={() => handleCheckboxChange(field.value)}
              >
                <div className="tol-form-checkboxes-text">
                  {field.children}
                  {field.subtext && (
                    <span className="rs-form-help-text">
                      <span
                        className="tol-danger-colour"
                        style={{ marginLeft: "10px" }}
                      >
                        *{" "}
                      </span>
                      {field.subtext}
                    </span>
                  )}
                </div>
              </Checkbox>
            </div>
          ))}
        </CheckboxGroup>
      </FormComponentWrapper>
    </div>
  );
}
