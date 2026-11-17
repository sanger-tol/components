/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type {
  ITextField,
  IEmailField,
  IPasswordField,
  ICountryselectField,
  IDatetimeField,
  ISingleselectField,
  ISingleselectcustomoptionField,
  IDropzoneField,
  IAutocompleteField,
  IMultipleselectField,
  IMarkdownField,
  ITextAreaField,
  ICheckboxFormField,
  IFormComponent,
  ILabelAndValueDataInstance,
  IUserProfileFormData,
  PAutoComplete,
  ICheckboxField,
  IFormTagField,
  IToggleFormField,
  ISubformField,
} from ".."

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

export type TUserProfileFormDataOrNull = IUserProfileFormData | null;

export type TFormComponentWrapper = Partial<Omit<IFormComponent, "type">>;

export type TFormTextAreaField = Omit<ITextAreaField, "type" | "name">;

export type TFormAutoCompleteField = Omit<
  IAutocompleteField,
  "type" | "name" | "dataSource"
>;

export type TFormCountrySelectField = Omit<
  ICountryselectField,
  "type" | "name"
>;

export type TFormDropzoneField = Omit<IDropzoneField, "type" | "name">;

export type TFormCheckboxFields = Omit<
  ICheckboxFormField,
  "type" | "defaultChecked"
>;

export type TFormDatetimeField = Omit<IDatetimeField, "type" | "name">;

export type TFormMultipleSelectField = Omit<
  IMultipleselectField,
  "type" | "name"
>;

export type TFormRemoteAutoCompleteField = Omit<PAutoComplete, "onChange">;

export type TFormSingleSelectField = Omit<Partial<ISingleselectField>, "data">;

export type TFormSingleSelectCustomOptionField = Omit<
  ISingleselectcustomoptionField,
  "type" | "name"
>;

export type TFormMarkdownField = Omit<IMarkdownField, "type" | "name">;

export type TAutoCompleteValue = string | { value: string; id?: string };

export type TLabelAndValueData = ILabelAndValueDataInstance[];

export type TTextFieldType = "text" | "email" | "password";

export type TCheckboxFields = ICheckboxField[];

export type TFormTags = IFormTagField;

export type TFormLabelIconPosition = "left" | "right";

/** The navigation status of a form field. */
export type TFieldNavStatus =
  | "auto"
  | "locked"
  | "error"
  | "required"
  | "complete"
  | "recommended"
  | "none";

/** A path into nested form data, using object keys and array indexes. */
export type TFormValuePath = readonly (string | number)[];

/** A form data path that starts with a top-level field name. */
export type TFormFieldPath = readonly [string, ...(string | number)[]];