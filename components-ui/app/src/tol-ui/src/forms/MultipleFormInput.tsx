/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { cloneElement, useEffect } from "react";
import {
  Button,
  PButton,
  createNewInput,
  FormComponentWrapper,
} from "..";
import type { TFormField } from "..";

export interface PMultipleFormInput {
  field: TFormField;
  formData: object;
  setFormData: (data: object) => void;
  setModifiedFields: (data: object) => void;
  renderField: (field: any) => JSX.Element | null;
  onChange: (name: string, value: any) => void;
  minOne?: boolean;
}

export function MultipleFormInput(props: PMultipleFormInput) {
  const { field, formData, setFormData, setModifiedFields, renderField, onChange, minOne } = props;
  const fieldData = formData[field.name] || {};

  useEffect(() => {
    // Want to remove any undefined entries that may have been created before
    // fieldData was populated
    if (minOne && Object.keys(fieldData).length === 0) {
      createNewInput(field.name, formData, setFormData);
    }
    for (const key in fieldData) {
      if (key.includes("undefined")) {
        handleDeleteInput(key, false);
      }
    }
  }, [fieldData])

  const addButton: PButton = {
    onClick: () => {
      // uses a random 3 digit number as an id
      createNewInput(field.name, formData, setFormData, setModifiedFields);
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

  const handleDeleteInput = (input: string, modify: boolean) => {
    const updatedFormData = {
      ...formData,
      [field.name]: {
        ...formData[field.name],
      },
    };
    delete updatedFormData[field.name][input];
    setFormData(updatedFormData);
    if (modify) {
      setModifiedFields(prev => ({
        ...prev,
        [field.name]: updatedFormData[field.name],
      }));
    }
  }

  return (
    <FormComponentWrapper {...field}>
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
                onChange(field.name, { ...(values || {}), ...newValue });
              }),
              key: input,
              label: undefined
            })}
          </div>
          {(!minOne || Object.keys(fieldData).length > 1) && (
            <div style={{ alignSelf: "center" }}>
              <Button
                {...minusButton}
                onClick={() => handleDeleteInput(input, true)}
              />
            </div>
          )}
        </div>
      ))}
    </FormComponentWrapper>
  );
}