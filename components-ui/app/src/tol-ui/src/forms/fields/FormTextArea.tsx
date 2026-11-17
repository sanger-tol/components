/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { FormComponentWrapper, TextEditor, TFormTextAreaField } from "../..";


export interface PFormTextArea extends TFormTextAreaField {
  /**
   * The name of the form field. This is used to identify the field in the form data.
   */
  name?: string;
  /**
   * The value of the form field. This is used to set the initial value of the field and
   * to update the value when the user types in the field.
   */
  value: string;
  /**
   * The callback function that is called when the value of the form field changes.
   * Empty editor documents are returned as an empty string in every output format.
   */
  setValue: (value: string) => void;
}

/**
 * @autodoc
 * 
 * Renders a text-area form field inside the standard form component wrapper.
 */
export function FormTextArea(props: PFormTextArea) {
  const { name, readOnly, editable, options } = props;

  return (
    <FormComponentWrapper {...props} id={props.id ?? name}>
      <TextEditor
        {...props}
        normaliseEmptyValue
        editable={readOnly ? false : editable}
        placeholder={props.placeholder}
        menuButtons={[]}
        options={readOnly ? { ...options, resizable: false } : options}
      />
    </FormComponentWrapper>
  );
}
