/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { Checkbox, CheckboxGroup } from "rsuite";
import { FormComponentWrapper, ICheckboxFormField } from "..";


export interface PFormCheckboxes
  extends Omit<ICheckboxFormField, "type" | "defaultChecked"> {
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
  } = props;

  const [checkedItems, setCheckedItems] = useState(defaultChecked);

  const handleCheckboxChange = (value: string) => {
    const updatedCheckedItems = checkedItems.includes(value)
      ? checkedItems.filter((item: string) => item !== value)
      : [...checkedItems, value];
    setCheckedItems(updatedCheckedItems);
    props.setCheckedItems(updatedCheckedItems);
  };

  return (
    <div style={{ display: hidden ? "none" : "block" }}>
      <FormComponentWrapper {...props}>
        <CheckboxGroup
          id={id}
          name={`${id}-checkbox-group`}
          value={checkedItems}
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
                      <span className="tol-danger-colour" style={{ marginLeft: "10px" }}>
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
