/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect, useRef } from "react";
import { Schema } from "rsuite";
import {
  RSForm,
  Toaster,
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
  IFormConfig,
  PButton,
  setInitialData,
  validateForm,
  UNSUPPORTED_FIELD_TYPE,
  FormMarkdown,
  FormDatetime,
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
  ICheckboxFormField
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
  const { formConfig, initialData, fluid, model, onValidate } = props;

  const [formData, setFormData] = useState<object>({});
  const [formErrors, setFormErrors] = useState<Record<string, any>>({});
  const [modifiedFields, setModifiedFields] = useState<object>({});
  const [formId, _] = useState<any>(() => crypto.randomUUID());
  const hasUnsavedChanges = useRef(false);

  const formRef = useRef<any>(null);
  const toaster = Toaster();
  const defaultModel = Schema.Model({});

  useEffect(() => {
    if (initialData) {
      setInitialData(formConfig, setFormData, initialData);
    }
  }, []);

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
    const hasChanges = modifiedFields && Object.keys(modifiedFields).length > 0;
    hasUnsavedChanges.current = hasChanges;
    if (props.onUnsavedChanges) {
      props.onUnsavedChanges(hasChanges);
    }
  }, [modifiedFields, props.onUnsavedChanges]);

  const handleInputChange = (name: any, value: any) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    setModifiedFields((prev: any) => ({ ...prev, [name]: value }));
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
            name={textField.name}
            label={textField.label}
            accepter={textField.accepter}
            helpText={textField.helpText}
            placeholder={textField.placeholder}
            value={formData[textField.name] ?? ""}
            onChange={(value: any) => handleInputChange(textField.name, value)}
            type={textField.type}
            readOnly={textField.readOnly}
            centered={textField.centered}
          />
        );
      case "countryselect":
        const countryselectField = field as ICountryselectField;
        return (
          <CountrySelect
            label={countryselectField.label}
            value={formData[countryselectField.name] ?? ""}
            setValue={(value: any) => handleInputChange(field.name, value)}
            errorText={errorText}
          />
        );
      case "datetime":
        const datetimeField = field as IDatetimeField;
        return (
          <FormDatetime
            name={datetimeField.name}
            label={datetimeField.label}
            value={formData[datetimeField.name] ?? ""}
            onChange={(value: any) => handleInputChange(datetimeField.name, value)}
            helpText={datetimeField.helpText}
            errorText={errorText}
            placeholder={datetimeField.placeholder}
            hideMinutes={datetimeField.hideMinutes}
          />
        );
      case "singleselect":
        const singleselectField = field as ISingleselectField;
        return (
          <RSForm.Group controlId={`${formId}-${singleselectField.name}`}>
            <RSForm.ControlLabel>{singleselectField.label}</RSForm.ControlLabel>
            <SingleSelect
              data={singleselectField.data}
              placeholder={singleselectField.placeholder}
              value={formData[singleselectField.name] ?? ""}
              setValue={(value: any) => handleInputChange(singleselectField.name, value)}
              block={singleselectField.block}
            />
            <RSForm.ErrorMessage show={Boolean(errorText)} placement="bottomStart">{errorText}</RSForm.ErrorMessage>
          </RSForm.Group>
        );
      case "singleselectcustomoption":
        const singleselectcustomoptionField = field as ISingleselectcustomoptionField;
        return (
          <SingleSelectCustomOption
            id={formId}
            value={formData[singleselectcustomoptionField.name] ?? ""}
            setValue={(value: any) => handleInputChange(singleselectcustomoptionField.name, value)}
            errorText={errorText}
            data={singleselectcustomoptionField.data}
            label={singleselectcustomoptionField.label}
            customOptionPlaceholder={singleselectcustomoptionField.customOptionPlaceholder}
          />
        );
      case "dropzone":
        const dropzoneField = field as IDropzoneField;
        return (
          <Dropzone
            resource={dropzoneField.resource}
            dataSource={dropzoneField.dataSource}
            fileType={dropzoneField.fileType}
            generateMessages={dropzoneField.generateMessages}
            setResponse={dropzoneField.setResponse}
            errorText={errorText}
          />
        );
      case "autocomplete":
        if (field.datasource) {
          const remoteAutocompleteField = field as IAutocompleteField & PRemoteAutoComplete
          return (
            <RemoteAutoComplete
              dataSource={remoteAutocompleteField.datasource}
              objectType={remoteAutocompleteField.objectType}
              displayFields={remoteAutocompleteField.displayFields}
              displayFieldsTitle={remoteAutocompleteField.displayFieldsTitle}
              searchBy={remoteAutocompleteField.searchBy}
              label={remoteAutocompleteField.label}
              data={remoteAutocompleteField.data}
              value={formData[remoteAutocompleteField.name] ?? ""}
              onChange={(value: any) => handleInputChange(remoteAutocompleteField.name, value)}
              errorText={errorText}
            />
          )
        } else {
          const autocompleteField = field as IAutocompleteField;
          return (
          <AutoComplete
            label={autocompleteField.label}
            data={autocompleteField.data}
            value={formData[autocompleteField.name] ?? ""}
            onChange={(value: any) => handleInputChange(autocompleteField.name, value)}
            errorText={errorText}
          />
        );
        }
      case "multipleselect":
        const multipleselectField = field as IMultipleselectField;
        return (
          <MultipleSelect
            block={multipleselectField.block}
            data={multipleselectField.data}
            label={multipleselectField.label}
            value={formData[multipleselectField.name] || []}
            setValue={(value: any) => handleInputChange(multipleselectField.name, value)}
            errorText={errorText}
            placeholder={multipleselectField.placeholder}
            disabled={multipleselectField.disabled}
            loading={multipleselectField.loading}
            open={multipleselectField.open}
            onOpen={multipleselectField.onOpen}
            onEntering={multipleselectField.onEntering}
            onClose={multipleselectField.onClose}
            onClick={multipleselectField.onClick}
            renderMenuItem={multipleselectField.renderMenuItem}
            renderValue={multipleselectField.renderValue}
            noSearch={multipleselectField.noSearch}
          />
        );
      case "markdown":
        const markdownField = field as IMarkdownField;
        return (
          <FormMarkdown
            value={formData[markdownField.name] ?? ""}
            onChange={(value: any) => handleInputChange(markdownField.name, value)}
            preview={markdownField.preview}
            label={markdownField.label}
            removeCommands={markdownField.removeCommands}
            height={markdownField.height}
            helpText={markdownField.helpText}
            errorText={errorText}
          />
        );
      case "checkbox":
        const checkboxField = field as ICheckboxFormField;
        return (
          <FormCheckboxes
            id={`${formId}-${checkboxField.name}-checkbox`}
            label={checkboxField.label}
            checkboxConfig={checkboxField.checkboxConfig}
            checkedItems={formData[checkboxField.name] ?? []}
            setCheckedItems={(value: any) =>
              handleInputChange(checkboxField.name, value)
            }
            errorText={errorText}
            hidden={checkboxField.hidden}
            inline={checkboxField.inline}
            indeterminate={checkboxField.indeterminate}
            defaultChecked={checkboxField.defaultChecked}
          />
        );
      default:
        console.warn(`${UNSUPPORTED_FIELD_TYPE} ${field.type}`);
        return null;
    }
  };

  return (
    <div className="form-wrapper">
      <RSForm
        fluid={fluid}
        ref={formRef}
        id={`form-${formId}`}
        onCheck={setFormErrors}
        onSubmit={(e: any) => {
          e.preventDefault();
          validateForm(formRef, toaster, formData, props.onSubmit);
        }}
        model={model || defaultModel}
        formValue={formData}
      >
        {formConfig.fields.map((field: any) => (
          <div key={`${formId}-${field.name}`}>{renderField(field)}</div>
        ))}
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
                  loading={button.loading}
                  onClick={() => {
                    if (modifiedFields && onValidate) {
                      onValidate(
                        validateForm(formRef, toaster, formData, props.onSubmit)
                      );
                    }
                    setModifiedFields({});
                    if (button.onClick) {
                      button.onClick(formData);
                    }
                  }}
                />
              )
            )}
          </div>
        )}
      </RSForm>
    </div>
  );
}

