/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  FormLabel,
  IFormLabelIcon,
  ITextAreaField,
  RSForm,
  TextEditor,
} from "..";

export interface PFormTextArea extends ITextAreaField {}

export function FormTextArea(props: PFormTextArea) {
  const {
    name,
    value,
    setValue,
    menuButtons,
    returnValueType,
    customExtensions,
    customButtons,
    label,
    helpText,
    errorText,
    icon,
    labelInline,
    readOnly,
    required,
    centered,
    placeholder,
  } = props;

  return (
    <RSForm.Group>
      <FormLabel />
      <TextEditor {...props} />
      <RSForm.HelpText>{helpText}</RSForm.HelpText>
      <RSForm.ErrorMessage>{errorText}</RSForm.ErrorMessage>
    </RSForm.Group>
  );
}
