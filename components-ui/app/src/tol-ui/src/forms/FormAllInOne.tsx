/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button } from "rsuite";
import { RSForm, Toaster, Message } from "../index";
import React, { useState, useEffect, useRef } from "react";
import {
  CountrySelect,
  FormTextField,
  SingleSelectCustomOption,
  SingleSelect,
  MultipleSelect,
  AutoComplete,
  Dropzone,
  FormCheckboxes,
} from "./index";

export type Appearance = "default" | "primary" | "link" | "subtle" | "ghost";
export type Color =
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "cyan"
  | "blue"
  | "violet";
export type ButtonType = "button" | "submit" | "reset" | undefined;

interface FormConfig {
  fields: object[];
  buttonConfig?: Buttons;
}

interface Buttons {
  buttons: ButtonConfig[];
  buttonStyle?: React.CSSProperties;
}

interface ButtonConfig {
  text: string;
  type?: ButtonType;
  block?: boolean;
  appearance?: Appearance;
  active?: boolean;
  color?: Color;
  disabled?: boolean;
  loading?: boolean;
  endIcon?: React.ReactNode;
  startIcon?: React.ReactNode;
  onClick: (formData?: object) => void;
}

interface Props {
  formConfig: FormConfig;
  initialData?: object;
  fluid?: boolean;
  model?: any;
  onUnsavedChanges?: (hasUnsavedChanges: boolean) => void;
  onValidate?: (isValid: boolean) => void;
  onSubmit?: (formData: object, isValid: boolean) => void;
}

const MISSING_DATA_ERROR =
  "Please complete all required fields before submitting.";
const UNSUPPORTED_FIELD_TYPE = "Unsupported field type:";

export function FormAllInOne(props: Props) {
  const { formConfig, initialData, fluid, model, onValidate } = props;

  const [formData, setFormData] = useState<object>({});
  const [modifiedFields, setModifiedFields] = useState<object>({});
  const [formId, _] = useState<any>(() => crypto.randomUUID());
  const hasUnsavedChanges = useRef(false);

  const formRef = useRef<any>(null);
  const toaster = Toaster();

  useEffect(() => {
    if (initialData) {
      setInitialData(initialData);
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

  const pushErrorMessage = (message: string) => {
    toaster.push(<Message children={message} type="error" showIcon={true} />, {
      duration: 4000,
    });
  };

  useEffect(() => {
    const hasChanges = modifiedFields && Object.keys(modifiedFields).length > 0;
    hasUnsavedChanges.current = hasChanges;
    if (props.onUnsavedChanges) {
      props.onUnsavedChanges(hasChanges);
    }
  }, [modifiedFields, props.onUnsavedChanges]);

  const validateForm = () => {
    if (!formRef.current.check()) {
      pushErrorMessage(MISSING_DATA_ERROR);
      return false;
    } else {
      if (props.onSubmit) {
        props.onSubmit(formData, true);
      }
      return true;
    }
  };

  const handleInputChange = (name: any, value: any) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    setModifiedFields((prev: any) => ({ ...prev, [name]: value }));
  };

  const setInitialData = (data?: any) => {
    setFormData(() => {
      const initialData = {};
      formConfig.fields.forEach((field: any) => {
        if (field.type === "checkbox" && field.defaultChecked) {
          initialData[field.name] = field.defaultChecked;
        } else {
          initialData[field.name] = data[field.name] || "";
        }
      });
      return initialData;
    });
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
        return (
          <AutoComplete
            label={field.label}
            data={field.data}
            value={formData[field.name] ?? ""}
            onChange={(value: any) => handleInputChange(field.name, value)}
          />
        );
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
        onSubmit={validateForm}
        model={model || null}
        formValue={formData}
      >
        {formConfig.fields.map((field: any) => (
          <div key={`${formId}-${field.name}`}>{renderField(field)}</div>
        ))}
        {formConfig.buttonConfig && (
          <div style={formConfig.buttonConfig.buttonStyle}>
            {formConfig.buttonConfig.buttons.map(
              (button: ButtonConfig, index: number) => (
                <Button
                  key={`form-${formId}-button-${index}`}
                  children={button.text}
                  appearance={button.appearance}
                  color={button.color}
                  active={button.active}
                  block={button.block}
                  disabled={button.disabled}
                  loading={button.loading}
                  endIcon={button.endIcon}
                  startIcon={button.startIcon}
                  type={button.type}
                  onClick={() => {
                    if (modifiedFields && onValidate) {
                      onValidate(validateForm());
                    }
                    setModifiedFields({});
                    button.onClick(formData);
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
