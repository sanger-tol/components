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

export const pushErrorMessage = (message: string, toaster: Toaster) => {
  toaster.push(<Message children={message} type="error" showIcon={true} />, {
    duration: 4000,
  });
};

export const setInitialData = (
  formConfig: IFormConfig,
  setFormData: React.Dispatch<React.SetStateAction<object>>,
  data?: any
) => {
  setFormData(() => {
    const initialData = {};
    formConfig.fields.forEach((field: any) => {
      if (field.type === "checkbox" && field.defaultChecked) {
        initialData[field.name] = field.defaultChecked;
      } else {
        initialData[field.name] = data[field.name] || "";
      }
    });
    return initialData;
  });
};

export const validateForm = (
  formRef: React.RefObject<any>,
  toaster: Toaster,
  formData: object,
  onSubmit?: (formData: object, isValid: boolean) => void
) => {
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
