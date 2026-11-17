/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { MultipleFormInput } from "../..";
import type {
  PMultipleFormInput,
  TFormField,
  TRenderFormField,
} from "../..";

/** Props for one top-level field row in a form. */
export interface PFormFieldRow
  extends Pick<
    PMultipleFormInput,
    "formData" | "setFormData" | "setModifiedFields" | "onChange"
  > {
  /** The field to render. */
  field: TFormField;
  /** Whether the field's label sits beside its control. */
  inlineLabel: boolean;
  /** Whether the field is read-only. Only used for multiple fields. */
  readOnly: boolean;
  /** Renders the field's control. */
  renderField: TRenderFormField;
}

// Renders one top-level field, using MultipleFormInput for repeatable non-subform fields.
export function FormFieldRow(props: PFormFieldRow) {
  const {
    field,
    formData,
    inlineLabel,
    onChange,
    readOnly,
    renderField,
    setFormData,
    setModifiedFields,
  } = props;

  // Repeatable subforms manage their own array, so they render like any other field
  if (field.multiple && field.type !== "subform") {
    return (
      <div id={field.id}>
        <MultipleFormInput
          renderField={renderField}
          field={{ ...field, readOnly }}
          formData={formData}
          setFormData={setFormData}
          setModifiedFields={setModifiedFields}
          minOne={field.minOne}
          onMinus={field.onMinus}
          onChange={onChange}
        />
      </div>
    );
  }

  return (
    <div
      id={field.id}
      className={`tol-form-wrapper-unique-sections-field ${
        inlineLabel ? "tol-form-field-inline" : ""
      }`}
    >
      {renderField(field)}
    </div>
  );
}
