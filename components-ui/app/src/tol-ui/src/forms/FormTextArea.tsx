/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  FormComponentWrapper,
  ITextAreaField,
  TextEditor,
} from "..";

export interface PFormTextArea extends Omit<ITextAreaField, "type"> {
  value: string;
  setValue: (value: string) => void;
}

export function FormTextArea(props: PFormTextArea) {
  const { name } = props;

  return (
    <FormComponentWrapper {...props} id={name}>
      <TextEditor {...props} />
    </FormComponentWrapper>
  );
}
