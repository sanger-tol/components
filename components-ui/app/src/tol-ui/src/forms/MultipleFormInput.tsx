/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { cloneElement, useEffect } from "react";
import {
  Button,
  RSForm,
  PButton,
  createNewInput
} from "..";

export interface PMultipleFormInput {
  field: any;
  formData: object;
  setFormData: (data: object) => void;
  renderField: (field: any) => JSX.Element | null;
  minOne?: boolean;
}

export function MultipleFormInput(props: PMultipleFormInput) {
  const { field, formData, setFormData, renderField, minOne } = props;
  const fieldData = formData[field.name] || {};

  useEffect(() => {
    // Ensure at least one input is present if minOne is true
    if (minOne && Object.keys(fieldData).length === 0) {
      createNewInput(field.name, formData, setFormData);
    }
  }, [])

  const addButton: PButton = {
    onClick: () => {
      // uses a random 3 digit number as an id
      createNewInput(field.name, formData, setFormData);
    },
    type: "success",
    icon: "plus",
    position: "right",
  };

  const minusButton: PButton = {
    type: "error",
    icon: "minus",
    position: "right",
  };

  const handleDeleteInput = (input: string) => {
    const updatedFormData = {
      ...formData,
      [field.name]: {
        ...formData[field.name],
      },
    };
    delete updatedFormData[field.name][input];
    setFormData(updatedFormData);
  }

  return (
    <div>
      {field.label && <RSForm.ControlLabel>{field.label}</RSForm.ControlLabel>}
      <Button {...addButton} />
      {Object.keys(fieldData).map((input, index) => (
        <div
          key={index}
          className="tol-multiple-form-input-row"
        >
          <div style={{ flex: 1 }}>
            {cloneElement(renderField(field)!, {
              value: formData[field.name][input],
              onChange: ((value: string) => {
                const newValue = { [input]: value };
                const values = formData[field.name];
                setFormData({
                  ...formData,
                  [field.name]: { ...(values || {}), ...newValue }
                });
              }),
              key: input,
              label: undefined
            })}
          </div>
          {(!minOne || Object.keys(fieldData).length > 1) && (
            <div style={{ alignSelf: "center" }}>
              <Button
                {...minusButton}
                onClick={() => handleDeleteInput(input)}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}