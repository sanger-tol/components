/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { FormComponentWrapper, ITextField, RSForm } from "..";

export interface PFormTextField extends Omit<ITextField, "type"> {
  id: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: "text" | "email" | "password";
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
