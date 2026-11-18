/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  AutoComplete,
  CountrySelect,
  Dropzone,
  FormCheckboxes,
  FormComponentWrapper,
  FormDatetime,
  FormMarkdown,
  FormTags,
  FormTextArea,
  FormTextField,
  FormToggle,
  MultipleSelect,
  READ_ONLY_FIELD_PLACEHOLDER,
  RemoteAutoComplete,
  SingleSelect,
  SingleSelectCustomOption,
  SubformField,
  getValueAtPath,
  isEmptyFieldValue,
  isReadOnlyStatus,
  isRecord,
} from "../..";
import type {
  IAutocompleteField,
  ICheckboxFormField,
  ICountryselectField,
  IDatetimeField,
  IDropzoneField,
  IFormFieldContext,
  IFormTagField,
  IFormValueSource,
  IMarkdownField,
  IMultipleselectField,
  ISingleselectField,
  ISingleselectcustomoptionField,
  ISubformField,
  ITextAreaField,
  ITextField,
  IToggleFormField,
  PRemoteAutoComplete,
  TFormField,
  TFormFieldPath,
  TFormValuePath,
} from "../..";

/**
 * Renders the control for a form field, reading its value from `source` at
 * the field's path. Returns the control element itself, rather than a
 * component wrapping it, so `MultipleFormInput` can clone it per row.
 *
 * @param field - The field to render.
 * @param context - Form state and helpers shared by every field.
 * @param parentPath - Path to the record holding the field, empty for top-level fields.
 * @param parentReadOnly - Whether a parent subform is read-only.
 * @param source - Where the value is read and written. Defaults to the live form data.
 * @returns The field's control, or `null` when the field is hidden or unknown.
 */
export function renderFormField(
  field: TFormField,
  context: IFormFieldContext,
  parentPath: TFormValuePath = [],
  parentReadOnly = false,
  source: IFormValueSource = context.source,
): JSX.Element | null {
  if (!field) {
    return null;
  }

  const containingData =
    parentPath.length === 0
      ? source.data
      : getValueAtPath(source.data, parentPath);
  if (
    field.hiddenWhen?.(isRecord(containingData) ? containingData : source.data)
  ) {
    return null;
  }

  // Every parent path starts at a top-level field, so this is always a field path
  const fieldPath = [...parentPath, field.name] as unknown as TFormFieldPath;

  // Each control narrows the value to its own type
  const fieldValue: any =
    parentPath.length === 0
      ? source.data[field.name]
      : getValueAtPath(source.data, fieldPath);

  const setFieldValue = (value: unknown) => source.onChange(fieldPath, value);

  const errorKey = parentPath.length === 0 ? field.name : fieldPath.join(".");
  const errorText: string | undefined = context.formErrors[errorKey];

  const status = context.getStatus(field, fieldValue, errorText);
  const readOnly = parentReadOnly || isReadOnlyStatus(status);

  const placeholder =
    status === "locked" && isEmptyFieldValue(fieldValue)
      ? READ_ONLY_FIELD_PLACEHOLDER
      : field.placeholder;

  const controlId =
    parentPath.length === 0
      ? context.formId
      : `${context.formId}-${fieldPath.map(String).join("-")}`;

  switch (field.type.toLowerCase()) {
    case "text":
    case "email":
    case "password":
      const textField = field as ITextField;
      return (
        <FormTextField
          {...textField}
          id={controlId}
          readOnly={readOnly}
          placeholder={placeholder}
          value={fieldValue ?? ""}
          onChange={(value: any) => setFieldValue(value)}
          errorText={errorText}
        />
      );
    case "countryselect":
      const countryselectField = field as ICountryselectField;
      return (
        <CountrySelect
          {...countryselectField}
          id={controlId}
          readOnly={readOnly}
          placeholder={placeholder}
          value={fieldValue ?? ""}
          setValue={(value: any) => setFieldValue(value)}
          errorText={errorText}
        />
      );
    case "datetime":
      const datetimeField = field as IDatetimeField;
      return (
        <FormDatetime
          {...datetimeField}
          id={controlId}
          readOnly={readOnly}
          placeholder={placeholder}
          value={fieldValue ?? ""}
          onChange={(value: any) => setFieldValue(value)}
          errorText={errorText}
        />
      );
    case "singleselect":
      const singleselectField = field as ISingleselectField;
      return (
        <FormComponentWrapper
          {...singleselectField}
          id={controlId}
          readOnly={readOnly}
          value={fieldValue}
          placeholder={placeholder}
          errorText={errorText}
        >
          <SingleSelect
            {...singleselectField}
            disabled={readOnly || singleselectField.disabled}
            placeholder={placeholder}
            value={fieldValue ?? ""}
            onChange={(value: any) => setFieldValue(value)}
          />
        </FormComponentWrapper>
      );
    case "singleselectcustomoption":
      const singleselectcustomoptionField =
        field as ISingleselectcustomoptionField;
      return (
        <SingleSelectCustomOption
          {...singleselectcustomoptionField}
          id={controlId}
          readOnly={readOnly}
          placeholder={placeholder}
          value={fieldValue ?? ""}
          setValue={(value: any) => setFieldValue(value)}
          errorText={errorText}
        />
      );
    case "dropzone":
      const dropzoneField = field as IDropzoneField;
      return (
        <Dropzone
          {...dropzoneField}
          id={controlId}
          readOnly={readOnly}
          errorText={errorText}
        />
      );
    case "autocomplete":
      const autocompleteField = field as IAutocompleteField;
      if (autocompleteField.dataSource) {
        const remoteAutocompleteField = field as unknown as Omit<
          IAutocompleteField,
          "dataSource"
        > &
          PRemoteAutoComplete;
        return (
          <RemoteAutoComplete
            {...remoteAutocompleteField}
            id={controlId}
            readOnly={readOnly}
            placeholder={placeholder}
            value={fieldValue ?? ""}
            onChange={(value: any) => setFieldValue(value)}
            errorText={errorText}
          />
        );
      } else {
        return (
          <AutoComplete
            {...autocompleteField}
            id={controlId}
            readOnly={readOnly}
            placeholder={placeholder}
            value={fieldValue ?? ""}
            onChange={(value: any) => setFieldValue(value)}
            errorText={errorText}
          />
        );
      }
    case "multipleselect":
      const multipleselectField = field as IMultipleselectField;
      const multipleSelectValue = fieldValue;
      return (
        <MultipleSelect
          {...multipleselectField}
          id={controlId}
          disabled={Boolean(
            readOnly ||
            multipleselectField.disabled ||
            multipleselectField.disabledWhen?.(context.formData),
          )}
          readOnly={readOnly}
          placeholder={placeholder}
          value={Array.isArray(multipleSelectValue) ? multipleSelectValue : []}
          setValue={(value: any) => setFieldValue(value)}
          errorText={errorText}
        />
      );
    case "markdown":
      const markdownField = field as IMarkdownField;
      return (
        <FormMarkdown
          {...markdownField}
          id={controlId}
          readOnly={readOnly}
          placeholder={placeholder}
          value={fieldValue ?? ""}
          onChange={(value: any) => setFieldValue(value)}
          errorText={errorText}
        />
      );
    case "textarea":
      const textareaField = field as ITextAreaField;
      return (
        <FormTextArea
          {...textareaField}
          id={controlId}
          readOnly={readOnly}
          placeholder={placeholder}
          value={fieldValue ?? ""}
          setValue={(value: any) => setFieldValue(value)}
          errorText={errorText}
        />
      );
    case "tag":
      const tagField = field as IFormTagField;
      return (
        <FormTags
          {...tagField}
          id={controlId}
          readOnly={readOnly}
          placeholder={placeholder}
          value={[...(fieldValue ?? [])]}
          setValue={(value: readonly string[]) => setFieldValue([...value])}
          errorText={errorText}
        />
      );
    case "toggle":
      const toggleField = field as IToggleFormField;
      return (
        <FormToggle
          {...toggleField}
          id={`${controlId}-toggle`}
          readOnly={readOnly}
          value={fieldValue ?? false}
          onChange={(value: boolean) => setFieldValue(value)}
          errorText={errorText}
        />
      );
    case "checkbox":
      const checkboxField = field as ICheckboxFormField;
      const { defaultChecked, ...checkboxProps } = checkboxField;
      const hasInitialValue =
        getValueAtPath(context.initialData, fieldPath) !== undefined;
      return (
        <FormCheckboxes
          {...(hasInitialValue ? checkboxProps : checkboxField)}
          id={`${controlId}-checkbox`}
          readOnly={readOnly}
          checkedItems={fieldValue ?? []}
          setCheckedItems={(value: any) => setFieldValue(value)}
          errorText={errorText}
        />
      );
    case "subform":
      return (
        <SubformField
          field={field as ISubformField}
          path={fieldPath}
          value={fieldValue}
          controlId={controlId}
          readOnly={readOnly}
          errorText={errorText}
          source={source}
          onChange={setFieldValue}
          renderField={context.renderField}
          controls={context.subforms}
        />
      );
    default:
      return null;
  }
}
