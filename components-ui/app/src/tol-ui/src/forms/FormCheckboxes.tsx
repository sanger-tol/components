/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React, { useState } from "react";
import { RSForm } from "../index";
import { Checkbox, CheckboxGroup } from "rsuite"; // @ts-ignore

interface Props {
  id: string;
  label?: string;
  checkboxConfig: {
    fields: Array<{
      disabled?: boolean;
      defaultChecked?: boolean;
      value: string;
      children: React.ReactNode;
      style?: React.CSSProperties;
      subtext?: string;
    }>;
  };
  checkedItems: string[];
  setCheckedItems: Function;
  inline?: boolean;
  indeterminate?: boolean;
  hidden?: boolean;
  defaultChecked?: string[];
}

function FormCheckboxes(props: Props) {
  const {
    id,
    label,
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
      <RSForm.Group controlId={id}>
        {label && <RSForm.ControlLabel>{label}</RSForm.ControlLabel>}
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
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {field.children}
                  {field.subtext && (
                    <span className="rs-form-help-text">
                      <span style={{ color: "red", marginLeft: "10px" }}>
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
      </RSForm.Group>
    </div>
  );
}

export default FormCheckboxes;
