/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from "react";
import { Message, Toaster } from "rsuite";
import { 
  IFormConfig,
  MISSING_DATA_ERROR
} from "..";

export function pushErrorMessage (message: string, toaster: Toaster) {
  toaster.push(<Message children={message} type="error" showIcon={true} />, {
    duration: 4000,
  });
};

export function setInitialData (
  formConfig: IFormConfig,
  setFormData: React.Dispatch<React.SetStateAction<object>>,
  data?: any
) {
  setFormData(() => {
    const initialData = {};
    formConfig.fields.forEach((field: any) => {
      if (field.type === "checkbox" && field.defaultChecked) {
        initialData[field.name] = field.defaultChecked;
      } else if (field.multiple){
        initialData[field.name] = data[field.name] || {};
      } else {
        initialData[field.name] = data[field.name] || "";
      }
    });
    return initialData;
  });
};

export function validateForm (
  formRef: React.RefObject<any>,
  toaster: Toaster,
  formData: object,
  onSubmit?: (formData: object, isValid: boolean) => void
) {
  if (!formRef.current || !formRef.current.check()) {
    pushErrorMessage(MISSING_DATA_ERROR, toaster);
    return false;
  } else {
    if (onSubmit) {
      onSubmit(formData, true);
    }
    return true;
  }
};

export function createNewInput (
  fieldName: string,
  formData: object,
  setFormData: React.Dispatch<React.SetStateAction<object>>
) {
  const newInput = `${fieldName}${Math.floor(Math.random() * 900) + 100}`;
  const updatedFormData = {
    ...formData,
    [fieldName]: {
      ...formData[fieldName],
      [newInput]: "",
    },
  };
  setFormData(updatedFormData); 
}
