/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React, { useState, useEffect, useRef } from "react";
import { Schema } from "rsuite";
import {
  RSForm,
  CountrySelect,
  FormTextField,
  SingleSelectCustomOption,
  SingleSelect,
  MultipleSelect,
  AutoComplete,
  RemoteAutoComplete,
  Dropzone,
  FormCheckboxes,
  Button,
  createInitialDataSnapshot,
  validateForm,
  UNSUPPORTED_FIELD_TYPE,
  FormMarkdown,
  FormDatetime,
  MultipleFormInput,
  deepestEqual,
  normaliseCaps,
  FormComponentWrapper,
  FormTextArea,
} from "..";

import type {
  IFormConfig,
  PButton,
  TFormField,
  ITextField,
  ICountryselectField,
  IDatetimeField,
  ISingleselectField,
  ISingleselectcustomoptionField,
  IDropzoneField,
  IAutocompleteField,
  PRemoteAutoComplete,
  IMultipleselectField,
  IMarkdownField,
  ICheckboxFormField,
  ITextAreaField,
} from "..";

export interface PFormAllInOne {
  formConfig: IFormConfig;
  initialData?: object;
  fluid?: boolean;
  model?: any;
  onUnsavedChanges?: (hasUnsavedChanges: boolean) => void;
  onValidate?: (isValid: boolean) => void;
  onSubmit?: (formData: object, isValid: boolean) => void;
}

export function FormAllInOne(props: PFormAllInOne) {
  const { formConfig, initialData, fluid = true, model, onValidate } = props;

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, any>>({});
  const [modifiedFields, setModifiedFields] = useState<Record<string, any>>({});
  const [formId, _] = useState<any>(() => crypto.randomUUID());
  const hasUnsavedChanges = useRef(false);
  const initialSnapshotRef = useRef<Record<string, any>>({});
  const onUnsavedChangesRef = useRef(props.onUnsavedChanges);

  const formRef = useRef<any>(null);
  const defaultModel = Schema.Model({});
  onUnsavedChangesRef.current = props.onUnsavedChanges;

  useEffect(() => {
    const nextSnapshot = createInitialDataSnapshot(formConfig, initialData);
    if (deepestEqual(nextSnapshot, initialSnapshotRef.current)) {
      return;
    }
    initialSnapshotRef.current = nextSnapshot;
    setFormData(nextSnapshot);
  }, [formConfig, initialData]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    const hasChanges = Object.keys(modifiedFields).length > 0;
    hasUnsavedChanges.current = hasChanges;
    if (onUnsavedChangesRef.current) {
      onUnsavedChangesRef.current(hasChanges);
    }
  }, [modifiedFields]);

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    setModifiedFields((prev: any) => {
      const initialValue = initialSnapshotRef.current[name];
      if (deepestEqual(value, initialValue ?? null)) {
        const { [name]: _, ...rest } = prev as any;
        return rest;
      }
      return { ...prev, [name]: value };
    });
  };

  const renderField = (field: TFormField) => {
    if (!field) {
      return null;
    }

    // Fetch any errors for this field from the record of all errors
    const errorText: string | undefined = formErrors[field.name];

    switch (field.type.toLowerCase()) {
      case "text":
      case "email":
      case "password":
        const textField = field as ITextField;
        return (
          <FormTextField
            id={formId}
            {...textField}
            value={formData[textField.name] ?? ""}
            onChange={(value: any) => handleInputChange(textField.name, value)}
            errorText={errorText}
          />
        );
      case "countryselect":
        const countryselectField = field as ICountryselectField;
        return (
          <CountrySelect
            {...countryselectField}
            value={formData[countryselectField.name] ?? ""}
            setValue={(value: any) => handleInputChange(field.name, value)}
            errorText={errorText}
          />
        );
      case "datetime":
        const datetimeField = field as IDatetimeField;
        return (
          <FormDatetime
            {...datetimeField}
            value={formData[datetimeField.name] ?? ""}
            onChange={(value: any) =>
              handleInputChange(datetimeField.name, value)
            }
            errorText={errorText}
          />
        );
      case "singleselect":
        const singleselectField = field as ISingleselectField;
        return (
          <FormComponentWrapper
            id={formId}
            {...singleselectField}
            errorText={errorText}
          >
            <SingleSelect
              {...singleselectField}
              value={formData[singleselectField.name] ?? ""}
              onChange={(value: any) =>
                handleInputChange(singleselectField.name, value)
              }
            />
          </FormComponentWrapper>
        );
      case "singleselectcustomoption":
        const singleselectcustomoptionField =
          field as ISingleselectcustomoptionField;
        return (
          <SingleSelectCustomOption
            id={formId}
            {...singleselectcustomoptionField}
            value={formData[singleselectcustomoptionField.name] ?? ""}
            setValue={(value: any) =>
              handleInputChange(singleselectcustomoptionField.name, value)
            }
            errorText={errorText}
          />
        );
      case "dropzone":
        const dropzoneField = field as IDropzoneField;
        return (
          <Dropzone
            {...dropzoneField}
            errorText={errorText}
          />
        );
      case "autocomplete":
        const autocompleteField = field as IAutocompleteField;
        if (autocompleteField.dataSource) {
          const remoteAutocompleteField = field as Omit<
            IAutocompleteField,
            "dataSource"
          > &
            PRemoteAutoComplete;
          return (
            <RemoteAutoComplete
              {...remoteAutocompleteField}
              value={formData[remoteAutocompleteField.name] ?? ""}
              onChange={(value: any) =>
                handleInputChange(remoteAutocompleteField.name, value)
              }
              errorText={errorText}
            />
          );
        } else {
          return (
            <AutoComplete
              {...autocompleteField}
              value={formData[autocompleteField.name] ?? ""}
              onChange={(value: any) =>
                handleInputChange(autocompleteField.name, value)
              }
              errorText={errorText}
            />
          );
        }
      case "multipleselect":
        const multipleselectField = field as IMultipleselectField;
        return (
          <MultipleSelect
            {...multipleselectField}
            value={formData[multipleselectField.name] ?? []}
            setValue={(value: any) =>
              handleInputChange(multipleselectField.name, value)
            }
            errorText={errorText}
          />
        );
      case "markdown":
        const markdownField = field as IMarkdownField;
        return (
          <FormMarkdown
            {...markdownField}
            value={formData[markdownField.name] ?? ""}
            onChange={(value: any) =>
              handleInputChange(markdownField.name, value)
            }
            errorText={errorText}
          />
        );
      case "textarea":
        const textareaField = field as ITextAreaField;
        return (
          <FormTextArea
            {...textareaField}
            value={formData[textareaField.name] ?? ""}
            setValue={(value: any) =>
              handleInputChange(textareaField.name, value)
            }
            errorText={errorText}
          />
        );
      case "checkbox":
        const checkboxField = field as ICheckboxFormField;
        return (
          <FormCheckboxes
            id={`${formId}-${checkboxField.name}-checkbox`}
            {...checkboxField}
            checkedItems={formData[checkboxField.name] ?? []}
            setCheckedItems={(value: any) =>
              handleInputChange(checkboxField.name, value)
            }
            errorText={errorText}
          />
        );
      default:
        console.warn(`${UNSUPPORTED_FIELD_TYPE} ${field.type}`);
        return null;
    }
  };

  const uniqueSections = Array.from(
    new Set(formConfig.fields.map((field) => field.section)),
  )
    .filter((section) => section !== undefined)
    .map((section) => section as string);

  return (
    <div className="form-wrapper">
      <RSForm
        fluid={fluid}
        ref={formRef}
        id={`form-${formId}`}
        onCheck={setFormErrors}
        onSubmit={(_formValue: any, event?: React.FormEvent) => {
          event?.preventDefault();
          validateForm(formRef, formData, props.onSubmit);
          setModifiedFields({});
        }}
        model={model || defaultModel}
        formValue={formData}
      >
        {uniqueSections.length > 0 ? (
          <>
            {uniqueSections.map((section) => (
              <div
                key={`section-${section}`}
                id={`section-${section}`}
                className="tol-form-wrapper-unique-sections-container"
              >
                <div className="tol-form-wrapper-unique-sections-header">
                  <h5>{normaliseCaps(section)}</h5>
                </div>
                {formConfig.fields
                  .filter((field) => field.section === section)
                  .map((field: any) => (
                    <div key={`${field.id ?? formId}-${field.name}`}>
                      {field.multiple ? (
                        <MultipleFormInput
                          renderField={renderField}
                          field={field}
                          formData={formData}
                          setFormData={setFormData}
                          setModifiedFields={setModifiedFields}
                          minOne={field.minOne}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <div
                          id={`${field.id}`}
                          key={`${field.id ?? formId}-${field.name}`}
                          className={`tol-form-wrapper-unique-sections-field ${
                            field.labelInline ? "tol-form-field-inline" : ""
                          }`}
                        >
                          {renderField(field)}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            ))}
            {formConfig.fields.some((field) => !field.section) && (
              <div
                key="section-misc"
                id="section-misc"
                className="tol-form-wrapper-unique-sections-container"
              >
                <div className="tol-form-wrapper-unique-sections-header">
                  <h5>{normaliseCaps("Misc")}</h5>
                </div>
                {formConfig.fields
                  .filter((field) => !field.section)
                  .map((field: any) => (
                    <div key={`${formId}-${field.name}`}>
                      {field.multiple ? (
                        <MultipleFormInput
                          renderField={renderField}
                          field={field}
                          formData={formData}
                          setFormData={setFormData}
                          setModifiedFields={setModifiedFields}
                          minOne={field.minOne}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <div
                          id={`${field.id}`}
                          key={`${field.id ?? formId}-${field.name}`}
                          className={`tol-form-wrapper-unique-sections-field ${
                            field.labelInline ? "tol-form-field-inline" : ""
                          }`}
                        >
                          {renderField(field)}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </>
        ) : (
          formConfig.fields.map((field: any) => (
            <div key={`${formId}-${field.name}`}>
              {field.multiple ? (
                <MultipleFormInput
                  renderField={renderField}
                  field={field}
                  formData={formData}
                  setFormData={setFormData}
                  setModifiedFields={setModifiedFields}
                  minOne={field.minOne}
                  onChange={handleInputChange}
                />
              ) : (
                <div
                  id={`${field.id}`}
                  key={`${field.id ?? formId}-${field.name}`}
                  className={`tol-form-wrapper-unique-sections-field ${field.labelInline ? "tol-form-field-inline" : ""}`}
                >
                  {renderField(field)}
                </div>
              )}
            </div>
          ))
        )}
        {formConfig.buttonConfig && (
          <div style={formConfig.buttonConfig.buttonStyle}>
            {formConfig.buttonConfig.buttons.map(
              (button: PButton, index: number) => (
                <Button
                  key={`form-${formId}-button-${index}`}
                  text={button.text}
                  type={button.type}
                  outline={button.outline}
                  active={button.active}
                  disabled={button.disabled}
                  disabledTooltip={button.disabledTooltip}
                  loading={button.loading}
                  icon={button.icon}
                  onClick={() => {
                    let isValid = true;
                    if (onValidate || props.onSubmit) {
                      isValid = validateForm(
                        formRef,
                        formData,
                        props.onSubmit,
                      );
                      if (onValidate) {
                        onValidate(isValid);
                      }
                    }
                    if (isValid) {
                      setModifiedFields({});
                    }
                    if (button.onClick) {
                      button.onClick(formData);
                    }
                  }}
                />
              ),
            )}
          </div>
        )}
      </RSForm>
    </div>
  );
}
