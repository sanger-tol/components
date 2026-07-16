/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { FormComponentWrapper, ITextField, RSForm } from "..";
import type { TTextFieldType } from "..";

export interface PFormTextField extends Omit<ITextField, "type"> {
  /**
   * The unique identifier for the form field. This is used to associate the label with the input field.
   */
  id: string;
  /**
   * The name of the form field. This is used to identify the field when submitting the form.
   */
  value?: string;
  /**
   * The callback function that is called when the value of the form field changes.
   */
  onChange?: (value: string) => void;
  /**
   * The type of the form field. This can be "text", "email", or "password".
   */
  type?: TTextFieldType;
  /**
   * Error text to display when form fails validation. This will be displayed below the input field.
   */
  errorText?: string;
}

export function FormTextField(props: PFormTextField) {
  const {
    centered,
    label,
    helpText,
    icon,
    labelInline,
    errorText,
    ...controlProps
  } = props;

  return (
    <FormComponentWrapper {...props}>
      <RSForm.Control
        {...controlProps}
        style={centered ? { textAlign: "center" } : {}}
      />
    </FormComponentWrapper>
  );
}
