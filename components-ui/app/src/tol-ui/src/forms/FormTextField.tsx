/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { FormComponentWrapper, ITextField, RSForm } from "..";

export interface PFormTextField extends Omit<ITextField, "type" | "label"> {
  id: string;
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: "text" | "email" | "password";
  centered?: boolean;
}

export function FormTextField(props: PFormTextField) {
  const { centered } = props;

  return (
    <FormComponentWrapper {...props}>
      <RSForm.Control
        {...props}
        style={centered ? { textAlign: "center" } : {}}
      />
    </FormComponentWrapper>
  );
}
