/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React, { useState, useEffect, useRef } from "react";
import { Schema } from "rsuite";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";
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
  READ_ONLY_FIELD_PLACEHOLDER,
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
  IFormSearchConfig,
} from "..";
import { FormOptionsContext } from "./FormOptionsContext";

export interface PFormAllInOne<TResult extends object = Record<string, unknown>> {
  formConfig: IFormConfig;
  /** Optional lookup controls shown before fields and used to prefill them. */
  searchConfig?: IFormSearchConfig<TResult>;
  initialData?: object;
  fluid?: boolean;
  model?: any;
  onUnsavedChanges?: (hasUnsavedChanges: boolean) => void;
  onValidate?: (isValid: boolean) => void;
  onSubmit?: (formData: object, isValid: boolean) => void;
}

/** Renders a configured form with optional search-first lookup and manual-entry controls. */
export function FormAllInOne<TResult extends object = Record<string, unknown>>(
  props: PFormAllInOne<TResult>,
) {
  const {
    formConfig,
    initialData,
    fluid = true,
    model,
    onValidate,
    searchConfig,
  } = props;

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, any>>({});
  const [modifiedFields, setModifiedFields] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchError, setSearchError] = useState<string>("");
  const [searching, setSearching] = useState<boolean>(false);
  const [showFields, setShowFields] = useState<boolean>(!searchConfig);
  const [formId, _] = useState<any>(() => crypto.randomUUID());
  const hasUnsavedChanges = useRef(false);
  const initialSnapshotRef = useRef<Record<string, any>>({});
  const onUnsavedChangesRef = useRef(props.onUnsavedChanges);

  const formRef = useRef<any>(null);
  const defaultModel = Schema.Model({});
  const formLocked = formConfig.options?.locked ?? false;
  const sectionsById = new Map(
    formConfig.sections?.map((section) => [section.id, section]),
  );
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

  const handleSearch = () => {
    const query = searchQuery.trim();
    setSearchError("");

    if (!query) {
      setSearchError(searchConfig?.emptySearchMessage ?? "Enter a search term.");
      return;
    }

    if (!searchConfig) {
      return;
    }

    setSearching(true);
    searchConfig.onSearchStateChange?.(true);
    Promise.resolve()
      .then(() => searchConfig.onSearch(query))
      .then((result) => {
        const nextFormData = {
          ...initialSnapshotRef.current,
          ...(result as Record<string, unknown>),
        };
        initialSnapshotRef.current = nextFormData;
        setFormData(nextFormData);
        setModifiedFields({});
        setShowFields(true);
        searchConfig.onSearchResult?.(result);
      })
      .catch((error: unknown) => {
        setSearchError(
          error instanceof Error && error.message
            ? error.message
            : searchConfig.searchErrorMessage,
        );
      })
      .finally(() => {
        setSearching(false);
        searchConfig.onSearchStateChange?.(false);
      });
  };

  const SearchControls = searchConfig && (
    <div className="tol-form-search-controls">
      <FormTextField
        id={`${formId}-search`}
        name="search"
        type="text"
        label={searchConfig.searchLabel}
        placeholder={searchConfig.searchPlaceholder}
        value={searchQuery}
        readOnly={formLocked}
        onChange={setSearchQuery}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            handleSearch();
          }
        }}
      />
      {searchError && (
        <p className="tol-form-search-error" role="alert">
          {searchError}
        </p>
      )}
      <div className="tol-form-search-actions">
        <Button
          text={searchConfig.manualEntryButtonText}
          disabled={searching || formLocked}
          onClick={() => {
            setSearchError("");
            setShowFields(true);
            searchConfig.onManualEntry?.();
          }}
        />
        <Button
          text={searchConfig.searchButtonText}
          icon="search"
          loading={searching}
          disabled={searching || formLocked}
          onClick={handleSearch}
        />
      </div>
    </div>
  );

  const isFieldReadOnly = (field: TFormField) =>
    Boolean(
      formLocked ||
        field.automatic ||
        field.readOnly ||
        (field.section && sectionsById.get(field.section)?.locked),
    );

  const isEmptyFieldValue = (value: unknown): boolean => {
    if (value === undefined || value === null || value === "") {
      return true;
    }
    if (Array.isArray(value)) {
      return value.length === 0;
    }
    if (
      typeof value === "object" &&
      Object.getPrototypeOf(value) === Object.prototype
    ) {
      return Object.values(value).every(isEmptyFieldValue);
    }
    return false;
  };

  const renderField = (field: TFormField) => {
    if (!field) {
      return null;
    }

    const readOnly = isFieldReadOnly(field);
    const placeholder =
      readOnly &&
      !field.automatic &&
      isEmptyFieldValue(formData[field.name])
        ? READ_ONLY_FIELD_PLACEHOLDER
        : field.placeholder;

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
            readOnly={readOnly}
            placeholder={placeholder}
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
            readOnly={readOnly}
            placeholder={placeholder}
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
            readOnly={readOnly}
            placeholder={placeholder}
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
            readOnly={readOnly}
            placeholder={placeholder}
            errorText={errorText}
          >
            <SingleSelect
              {...singleselectField}
              disabled={readOnly || singleselectField.disabled}
              placeholder={placeholder}
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
            readOnly={readOnly}
            placeholder={placeholder}
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
              readOnly={readOnly}
              placeholder={placeholder}
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
              readOnly={readOnly}
              placeholder={placeholder}
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
        const multipleSelectValue = formData[multipleselectField.name];
        return (
          <MultipleSelect
            {...multipleselectField}
            disabled={Boolean(
              readOnly ||
              multipleselectField.disabled ||
              multipleselectField.disabledWhen?.(formData),
            )}
            readOnly={readOnly}
            placeholder={placeholder}
            value={Array.isArray(multipleSelectValue) ? multipleSelectValue : []}
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
            readOnly={readOnly}
            placeholder={placeholder}
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
            readOnly={readOnly}
            placeholder={placeholder}
            value={formData[textareaField.name] ?? ""}
            setValue={(value: any) =>
              handleInputChange(textareaField.name, value)
            }
            errorText={errorText}
          />
        );
      case "checkbox":
        const checkboxField = field as ICheckboxFormField;
        const { defaultChecked, ...checkboxProps } = checkboxField;
        const hasInitialValue =
          (initialData as Record<string, any> | undefined)?.[
            checkboxField.name
          ] !== undefined;
        return (
          <FormCheckboxes
            id={`${formId}-${checkboxField.name}-checkbox`}
            {...(hasInitialValue ? checkboxProps : checkboxField)}
            readOnly={readOnly}
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
  const inlineLabels = formConfig.options?.inlineLabels ?? false;

  const formContent = (
    <div className="form-wrapper">
      {formLocked && (
        <div className="tol-form-read-only-banner" role="status">
          <FontAwesomeIcon icon={faLock} aria-hidden="true" />
          <span>This form is read-only</span>
        </div>
      )}
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
        {SearchControls}
        {showFields && uniqueSections.length > 0 ? (
          <>
            {uniqueSections.map((section) => {
              const sectionConfig = sectionsById.get(section);
              const sectionLocked = !formLocked && sectionConfig?.locked === true;

              return (
                <FormOptionsContext.Provider
                  key={`section-${section}`}
                  value={{
                    ...formConfig.options,
                    sectionLocked,
                  }}
                >
                  <div
                    id={`section-${section}`}
                    className="tol-form-wrapper-unique-sections-container"
                  >
                    <div className="tol-form-wrapper-unique-sections-header">
                      <h5>
                        {sectionConfig?.label ?? normaliseCaps(section)}
                        {sectionLocked ? (
                          <span className="tol-form-section-read-only">
                            <FontAwesomeIcon icon={faLock} aria-hidden="true" />
                            <em>Read-only</em>
                          </span>
                        ) : (
                          sectionConfig?.optional && (
                            <span className="tol-form-section-optional">
                              {" "}<em>Optional</em>
                            </span>
                          )
                        )}
                      </h5>
                    </div>
                    {formConfig.fields
                      .filter((field) => field.section === section)
                      .map((field: any) => (
                        <div key={`${field.id ?? formId}-${field.name}`}>
                          {field.multiple ? (
                            <MultipleFormInput
                              renderField={renderField}
                              field={{
                                ...field,
                                readOnly: isFieldReadOnly(field),
                              }}
                              formData={formData}
                              setFormData={setFormData}
                              setModifiedFields={setModifiedFields}
                              minOne={field.minOne}
                              onMinus={field.onMinus}
                              onChange={handleInputChange}
                            />
                          ) : (
                            <div
                              id={`${field.id}`}
                              key={`${field.id ?? formId}-${field.name}`}
                              className={`tol-form-wrapper-unique-sections-field ${
                                inlineLabels || field.labelInline
                                  ? "tol-form-field-inline"
                                  : ""
                              }`}
                            >
                              {renderField(field)}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </FormOptionsContext.Provider>
              );
            })}
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
                          field={{
                            ...field,
                            readOnly: isFieldReadOnly(field),
                          }}
                          formData={formData}
                          setFormData={setFormData}
                          setModifiedFields={setModifiedFields}
                          minOne={field.minOne}
                          onMinus={field.onMinus}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <div
                          id={`${field.id}`}
                          key={`${field.id ?? formId}-${field.name}`}
                          className={`tol-form-wrapper-unique-sections-field ${
                            inlineLabels || field.labelInline
                              ? "tol-form-field-inline"
                              : ""
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
        ) : showFields ? (
          formConfig.fields.map((field: any) => (
            <div key={`${formId}-${field.name}`}>
              {field.multiple ? (
                <MultipleFormInput
                  renderField={renderField}
                  field={{
                    ...field,
                    readOnly: isFieldReadOnly(field),
                  }}
                  formData={formData}
                  setFormData={setFormData}
                  setModifiedFields={setModifiedFields}
                  minOne={field.minOne}
                  onMinus={field.onMinus}
                  onChange={handleInputChange}
                />
              ) : (
                <div
                  id={`${field.id}`}
                  key={`${field.id ?? formId}-${field.name}`}
                  className={`tol-form-wrapper-unique-sections-field ${inlineLabels || field.labelInline ? "tol-form-field-inline" : ""}`}
                >
                  {renderField(field)}
                </div>
              )}
            </div>
          ))
        ) : null}
        {showFields && formConfig.buttonConfig && (
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
                  testid={button.testid}
                  disabledTooltip={button.disabledTooltip}
                  loading={button.loading}
                  icon={button.icon}
                  onClick={() => {
                    if (button.onClick) {
                      button.onClick(formData);
                      return;
                    }

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
                  }}
                />
              ),
            )}
          </div>
        )}
      </RSForm>
    </div>
  );

  return (
    <FormOptionsContext.Provider value={formConfig.options ?? {}}>
      {formContent}
    </FormOptionsContext.Provider>
  );
}
