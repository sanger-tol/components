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

/**
 * Displays an error toast with the provided message
 * 
 * @param message - The message to display
 * @param toaster - The component managing the toast stack
 */
export function pushErrorMessage(message: string, toaster: Toaster) {
  toaster.push(<Message children={message} type="error" showIcon={true} />, {
    duration: 4000,
  });
};

/**
 * Sets the initial data in a form to `data`
 * 
 * @remarks
 * Designed for the `FormAllInOne` component. 
 * 
 * @param formConfig - The form config object used to define the form
 * @param setFormData - The state setter for a form data state
 * @param data - The data to be set as the initial data
 */
export function setInitialData(
  formConfig: IFormConfig,
  setFormData: React.Dispatch<React.SetStateAction<object>>,
  data?: any
) {
  setFormData(() => createInitialDataSnapshot(formConfig, data));
};

export function createInitialDataSnapshot(
  formConfig: IFormConfig,
  data?: any
): Record<string, any> {
  const initialData: Record<string, any> = {};
  formConfig.fields.forEach((field: any) => {
    if (field.type === "checkbox" && field.defaultChecked) {
      initialData[field.name] = field.defaultChecked;
    } else if (field.multiple) {
      initialData[field.name] = data?.[field.name] || {};
    } else {
      initialData[field.name] = data?.[field.name] || "";
    }
  });
  return initialData;
}

/**
 * Validates data of a form. If valid, `onSubmit` is run. If not, an error toast is shown.
 * 
 * @param formRef - React ref to the target form
 * @param toaster - The toaster component to display the error toast
 * @param formData - The form data to validate
 * @param onSubmit - Runs if the form is valid
 * @returns A boolean describing whether or not the form was valid
 */
export function validateForm(
  formRef: React.RefObject<any>,
  toaster: Toaster,
  formData: object,
  onSubmit?: (formData: object, isValid: boolean) => void
): boolean {
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

export function createNewInput(
  fieldName: string,
  formData: object,
  setFormData: React.Dispatch<React.SetStateAction<object>>,
  setModifiedFields?: React.Dispatch<React.SetStateAction<object>>
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
  if (setModifiedFields) {
    setModifiedFields(prev => ({
      ...prev,
      [fieldName]: updatedFormData[fieldName],
    }));
  }
}
