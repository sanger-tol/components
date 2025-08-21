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
  MultipleFormInput
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
  const [modifiedFields, setModifiedFields] = useState<object>({});
  const [formId, _] = useState<any>(() => crypto.randomUUID());
  const hasUnsavedChanges = useRef(false);
  console.log(formData)

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

  const renderField = (field: any) => {
    if (!field) {
      return null;
    }

    switch (field.type.toLowerCase()) {
      case "text":
      case "email":
      case "password":
        return (
          <FormTextField
            id={formId}
            name={field.name}
            label={field.label}
            accepter={field.accepter}
            helpText={field.helpText}
            placeholder={field.placeholder}
            value={formData[field.name] ?? ""}
            onChange={(value: any) => handleInputChange(field.name, value)}
            type={field.type}
            readOnly={field.readOnly}
            centered={field.centered}
          />
        );
      case "countryselect":
        return (
          <CountrySelect
            label={field.label}
            value={formData[field.name] ?? ""}
            setValue={(value: any) => handleInputChange(field.name, value)}
          />
        );
      case "datetime":
        return (
          <FormDatetime
            name={field.name}
            label={field.label}
            value={formData[field.name] ?? ""}
            onChange={(value: any) => handleInputChange(field.name, value)}
            helpText={field.helpText}
            placeholder={field.placeholder}
            hideMinutes={field.hideMinutes}
          />
        );
      case "singleselect":
        return (
          <RSForm.Group controlId={`${formId}-${field.name}`}>
            <RSForm.ControlLabel>{field.label}</RSForm.ControlLabel>
            <SingleSelect
              data={field.data}
              placeholder={field.placeholder}
              value={formData[field.name] ?? ""}
              setValue={(value: any) => handleInputChange(field.name, value)}
              block={field.block}
            />
          </RSForm.Group>
        );
      case "singleselectcustomoption":
        return (
          <SingleSelectCustomOption
            id={formId}
            value={formData[field.name] ?? ""}
            setValue={(value: any) => handleInputChange(field.name, value)}
            data={field.data}
            label={field.label}
            customOptionPlaceholder={field.customOptionPlaceholder}
          />
        );
      case "dropzone":
        return (
          <Dropzone
            resource={field.resource}
            dataSource={field.dataSource}
            fileType={field.fileType}
            generateMessages={field.generateMessages}
            setResponse={field.setResponse}
          />
        );
      case "autocomplete":
        if (field.datasource) {
          return (
            <RemoteAutoComplete
              dataSource={field.datasource}
              objectType={field.objectType}
              displayFields={field.displayFields}
              displayFieldsTitle={field.displayFieldsTitle}
              searchBy={field.searchBy}
              label={field.label}
              data={field.data}
              value={formData[field.name] ?? ""}
              onChange={(value: any) => handleInputChange(field.name, value)}
            />
          )
        } else {
          return (
            <AutoComplete
              label={field.label}
              data={field.data}
              value={formData[field.name] ?? ""}
              onChange={(value: any) => handleInputChange(field.name, value)}
            />
          );
        }
      case "multipleselect":
        return (
          <MultipleSelect
            block={field.block}
            data={field.data}
            label={field.label}
            value={formData[field.name] || []}
            setValue={(value: any) => handleInputChange(field.name, value)}
            placeholder={field.placeholder}
            disabled={field.disabled}
            loading={field.loading}
            open={field.open}
            onOpen={field.onOpen}
            onEntering={field.onEntering}
            onClose={field.onClose}
            onClick={field.onClick}
            renderMenuItem={field.renderMenuItem}
            renderValue={field.renderValue}
            noSearch={field.noSearch}
          />
        );
      case "markdown":
        return (
          <FormMarkdown
            value={formData[field.name] ?? ""}
            onChange={(value: any) => handleInputChange(field.name, value)}
            preview={field.preview}
            label={field.label}
            removeCommands={field.removeCommands}
            height={field.height}
            helpText={field.helpText}
          />
        );
      case "checkbox":
        return (
          <FormCheckboxes
            id={`${formId}-${field.name}-checkbox`}
            label={field.label}
            checkboxConfig={field.checkboxConfig}
            checkedItems={formData[field.name] ?? []}
            setCheckedItems={(value: any) =>
              handleInputChange(field.name, value)
            }
            hidden={field.hidden}
            inline={field.inline}
            indeterminate={field.indeterminate}
            defaultChecked={field.defaultChecked}
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
        onSubmit={(e: any) => {
          e.preventDefault();
          validateForm(formRef, toaster, formData, props.onSubmit);
        }}
        model={model || defaultModel}
        formValue={formData}
      >
        {formConfig.fields.map((field: any) => (
          <div key={`${formId}-${field.name}`}>
            {field.multiple ? (
              <MultipleFormInput
                renderField={renderField}
                field={field}
                formData={formData}
                setFormData={setFormData}
              />
            ) : (
              renderField(field)
            )}
          </div>
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
