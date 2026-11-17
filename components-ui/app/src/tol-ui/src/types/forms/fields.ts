/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type {
  IAutocompleteField,
  ICheckboxField,
  ICheckboxFormField,
  ICountryselectField,
  IDatetimeField,
  IDropzoneField,
  IEmailField,
  IFormComponent,
  IFormTagField,
  ILabelAndValueDataInstance,
  IMarkdownField,
  IMultipleselectField,
  IPasswordField,
  ISingleselectField,
  ISingleselectcustomoptionField,
  ISubformField,
  ITextAreaField,
  ITextField,
  IToggleFormField,
  PAutoComplete,
} from "../..";

/** Union of every field configuration accepted by `IFormConfig`. */
export type TFormField =
  | ITextField
  | IEmailField
  | IPasswordField
  | ICountryselectField
  | IDatetimeField
  | ISingleselectField
  | ISingleselectcustomoptionField
  | IDropzoneField
  | IAutocompleteField
  | IMultipleselectField
  | IMarkdownField
  | ITextAreaField
  | ICheckboxFormField
  | IFormTagField
  | IToggleFormField
  | ISubformField;

/** Optional shared field properties accepted by a generic field wrapper. */
export type TFormComponentWrapper = Partial<Omit<IFormComponent, "type">>;

/** Textarea field options after the form-only `type` and `name` are removed. */
export type TFormTextAreaField = Omit<ITextAreaField, "type" | "name">;

/** Local autocomplete options after form-only props and the remote source are removed. */
export type TFormAutoCompleteField = Omit<
  IAutocompleteField,
  "type" | "name" | "dataSource"
>;

/** Country-select props after the form-only `type` and `name` are removed. */
export type TFormCountrySelectField = Omit<
  ICountryselectField,
  "type" | "name"
>;

/** Dropzone props after the form-only `type` and `name` are removed. */
export type TFormDropzoneField = Omit<IDropzoneField, "type" | "name">;

/** Checkbox-group props excluding its field discriminator and default value. */
export type TFormCheckboxFields = Omit<
  ICheckboxFormField,
  "type" | "defaultChecked"
>;

/** Datetime props after the form-only `type` and `name` are removed. */
export type TFormDatetimeField = Omit<IDatetimeField, "type" | "name">;

/** Multiple-select props after the form-only `type` and `name` are removed. */
export type TFormMultipleSelectField = Omit<
  IMultipleselectField,
  "type" | "name"
>;

/** Remote autocomplete props, excluding the callback supplied by its wrapper. */
export type TFormRemoteAutoCompleteField = Omit<PAutoComplete, "onChange">;

/** Single-select props accepted by the standalone control. */
export type TFormSingleSelectField = Omit<Partial<ISingleselectField>, "data">;

/** Custom-option select props after the field-only discriminator and name are removed. */
export type TFormSingleSelectCustomOptionField = Omit<
  ISingleselectcustomoptionField,
  "type" | "name"
>;

/** Markdown props after the form-only `type` and `name` are removed. */
export type TFormMarkdownField = Omit<IMarkdownField, "type" | "name">;

/** Value shapes accepted by the autocomplete control. */
export type TAutoCompleteValue = string | { value: string; id?: string };

/** Options represented as label/value pairs. */
export type TLabelAndValueData = ILabelAndValueDataInstance[];

/** Supported HTML input types for the shared text-field control. */
export type TTextFieldType = "text" | "email" | "password";

/** Checkbox options accepted by a checkbox group. */
export type TCheckboxFields = ICheckboxField[];

/** Field configuration accepted by the tag-input control. */
export type TFormTags = IFormTagField;

/** Supported positions for a form-field label icon. */
export type TFormLabelIconPosition = "left" | "right";
