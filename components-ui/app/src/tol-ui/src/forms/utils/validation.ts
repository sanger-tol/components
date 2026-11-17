/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type React from "react";
import { PopUpMessage, MESSAGE_TYPE, MISSING_DATA_ERROR } from "../..";

/**
 * Validates data of a form. If valid, `onSubmit` is run. If not, an error toast is shown.
 *
 * @param formRef - React ref to the target form
 * @param toaster - The toaster component to display the error toast
 * @param formData - The form data to validate
 * @param onSubmit - Runs if the form is valid
 * @returns A boolean describing whether or not the form was valid
 */
export function validateForm<T>(
  formRef: React.RefObject<any>,
  formData: T,
  onSubmit?: (formData: T, isValid: boolean) => void,
): boolean {
  if (!formRef.current || !formRef.current.check()) {
    PopUpMessage({
      message: MISSING_DATA_ERROR,
      type: MESSAGE_TYPE.ERROR,
    });
    return false;
  } else {
    onSubmit?.(formData, true);
    return true;
  }
}
