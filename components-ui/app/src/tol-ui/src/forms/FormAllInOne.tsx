/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React, { useState, useEffect, useRef } from "react";
import { Schema } from "rsuite";
import {
  RSForm,
  Button,
  createInitialDataSnapshot,
  validateForm,
  deepestEqual,
  normaliseCaps,
  FormFieldRow,
  FormOptionsContext,
  FormScrollNavLayout,
  FormSearchControls,
  FormSection,
  SubformDrawer,
  getNavGroups,
  getFieldStatus,
  isReadOnlyStatus,
  renderFormField,
  resolveScrollNavConfig,
  setValueAtPath,
  withFieldAnchorIds,
  Icon,
  useExpandedSubformItems,
  useSubformDrawer,
} from "..";

import type {
  IFormConfig,
  IFormFieldContext,
  IFormSearchConfig,
  PButton,
  TFormField,
  TFormFieldPath,
  TRenderFormField,
} from "..";

/** Props for `FormAllInOne`. */
export interface PFormAllInOne<
  TResult extends object = Record<string, unknown>,
> {
  formConfig: IFormConfig;
  /** Optional lookup controls shown before fields and used to prefill them. */
  searchConfig?: IFormSearchConfig<TResult>;
  /** Initial form data to populate the fields with. */
  initialData?: object;
  /** Whether the form should take the full width of its container. */
  fluid?: boolean;
  /** The form model used for validation. */
  model?: any;
  /** Callback invoked when the form has unsaved changes. */
  onUnsavedChanges?: (hasUnsavedChanges: boolean) => void;
  /** Callback invoked after form validation. */
  onValidate?: (isValid: boolean) => void;
  /** Callback invoked when the form is submitted. */
  onSubmit?: (formData: object, isValid: boolean) => void;
  /** Shown beside the scroll-nav title. Requires `options.scrollNav`. */
  titleAdornment?: React.ReactNode;
  /** Shown above the form inside the scroll container. Requires `options.scrollNav`. */
  contentHeader?: React.ReactNode;
  /** Shown below the scroll container. Requires `options.scrollNav`. */
  footer?: React.ReactNode;
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
  const [showFields, setShowFields] = useState<boolean>(!searchConfig);
  const [formId] = useState<string>(() => crypto.randomUUID());

  const hasUnsavedChanges = useRef(false);
  const initialSnapshotRef = useRef<Record<string, any>>({});
  const onUnsavedChangesRef = useRef(props.onUnsavedChanges);
  const formRef = useRef<any>(null);
  onUnsavedChangesRef.current = props.onUnsavedChanges;

  const defaultModel = Schema.Model({});
  const formLocked = formConfig.options?.locked ?? false;
  const inlineLabels = formConfig.options?.inlineLabels ?? false;
  const scrollNav = resolveScrollNavConfig(formConfig.options?.scrollNav);
  const fields = scrollNav
    ? withFieldAnchorIds(formConfig.fields, scrollNav.key)
    : formConfig.fields;
  const sectionsById = new Map(
    formConfig.sections?.map((section) => [section.id, section]),
  );
  const uniqueSections = Array.from(
    new Set(
      fields
        .map((field) => field.section)
        .filter((section): section is string => section !== undefined),
    ),
  );
  const unsectionedFields = fields.filter((field) => !field.section);

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
    onUnsavedChangesRef.current?.(hasChanges);
  }, [modifiedFields]);

  // Updates a nested field and tracks changes under its top-level field.
  const handleFieldInputChange = (path: TFormFieldPath, value: unknown) => {
    const [fieldName] = path;

    setFormData((previousData) => setValueAtPath(previousData, path, value));
    setModifiedFields((prev) => {
      const initialValue = initialSnapshotRef.current[fieldName];
      const currentValue = Object.prototype.hasOwnProperty.call(prev, fieldName)
        ? prev[fieldName]
        : initialValue;
      const updatedFieldValue = setValueAtPath(
        { [fieldName]: currentValue },
        path,
        value,
      )[fieldName];

      if (deepestEqual(updatedFieldValue, initialValue ?? null)) {
        const { [fieldName]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [fieldName]: updatedFieldValue };
    });
  };

  // Keeps the existing change interface for top-level form controls.
  const handleInputChange = (name: string, value: any) => {
    handleFieldInputChange([name], value);
  };

  // Merges a search result into the form and treats it as the new starting point.
  const handleSearchResult = (result: TResult) => {
    const nextFormData = {
      ...initialSnapshotRef.current,
      ...(result as Record<string, unknown>),
    };
    initialSnapshotRef.current = nextFormData;
    setFormData(nextFormData);
    setModifiedFields({});
    setShowFields(true);
  };

  const fieldStatus = (field: TFormField, value: unknown, error?: string) =>
    getFieldStatus(field, value, {
      formLocked,
      sectionLocked: sectionsById.get(field.section ?? "")?.locked === true,
      error,
    });

  const isFieldReadOnly = (field: TFormField) =>
    isReadOnlyStatus(
      fieldStatus(field, formData[field.name], formErrors[field.name]),
    );

  const subformDrawer = useSubformDrawer(formData, handleFieldInputChange);
  const expandedSubformItems = useExpandedSubformItems();

  const fieldContext: IFormFieldContext = {
    formId,
    formData,
    formErrors,
    initialData,
    source: { data: formData, onChange: handleFieldInputChange },
    getStatus: fieldStatus,
    renderField: (...args) => renderField(...args),
    subforms: {
      ...expandedSubformItems,
      openDrawer: subformDrawer.openDrawer,
    },
  };

  const renderField: TRenderFormField = (
    field,
    parentPath,
    parentReadOnly,
    source,
  ) => renderFormField(field, fieldContext, parentPath, parentReadOnly, source);

  const renderFieldRow = (field: TFormField) => (
    <FormFieldRow
      key={`${field.id ?? formId}-${field.name}`}
      field={field}
      inlineLabel={inlineLabels || Boolean(field.labelInline)}
      readOnly={isFieldReadOnly(field)}
      renderField={renderField}
      formData={formData}
      setFormData={setFormData}
      setModifiedFields={setModifiedFields}
      onChange={handleInputChange}
    />
  );

  const renderSections = () => (
    <>
      {uniqueSections.map((section) => {
        const sectionConfig = sectionsById.get(section);
        const sectionLocked = !formLocked && sectionConfig?.locked === true;

        return (
          <FormOptionsContext.Provider
            key={`section-${section}`}
            value={{ ...formConfig.options, sectionLocked }}
          >
            <FormSection
              id={section}
              title={sectionConfig?.label ?? normaliseCaps(section)}
              locked={sectionLocked}
              optional={sectionConfig?.optional}
            >
              {fields
                .filter((field) => field.section === section)
                .map(renderFieldRow)}
            </FormSection>
          </FormOptionsContext.Provider>
        );
      })}

      {unsectionedFields.length > 0 && (
        <FormSection id="misc" title={normaliseCaps("Misc")}>
          {unsectionedFields.map(renderFieldRow)}
        </FormSection>
      )}
    </>
  );

  // Runs a button's own action, or validates and submits the form.
  const handleButtonClick = (button: PButton) => {
    if (button.onClick) {
      button.onClick(formData);
      return;
    }

    let isValid = true;
    if (onValidate || props.onSubmit) {
      isValid = validateForm(formRef, formData, props.onSubmit);
      onValidate?.(isValid);
    }
    if (isValid) {
      setModifiedFields({});
    }
  };

  const formContent = (
    <div className="form-wrapper">
      {formLocked && (
        <div className="tol-form-read-only-banner" role="status">
          <Icon icon={"lock"} aria-hidden="true" />
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
        {searchConfig && (
          <FormSearchControls
            config={searchConfig}
            formId={formId}
            disabled={formLocked}
            onResult={handleSearchResult}
            onManualEntry={() => setShowFields(true)}
          />
        )}

        {showFields &&
          (uniqueSections.length > 0
            ? renderSections()
            : fields.map(renderFieldRow))}

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
                  onClick={() => handleButtonClick(button)}
                />
              ),
            )}
          </div>
        )}
      </RSForm>

      {subformDrawer.state && (
        <SubformDrawer
          drawer={subformDrawer}
          readOnly={isFieldReadOnly(subformDrawer.state.field)}
          renderField={renderField}
        />
      )}
    </div>
  );

  return (
    <FormOptionsContext.Provider value={formConfig.options ?? {}}>
      {scrollNav ? (
        <FormScrollNavLayout
          config={scrollNav}
          groups={
            showFields
              ? getNavGroups(
                  fields,
                  formConfig.sections,
                  scrollNav.showStatus === false
                    ? undefined
                    : (field) =>
                        fieldStatus(
                          field,
                          formData[field.name],
                          formErrors[field.name],
                        ),
                )
              : []
          }
          titleAdornment={props.titleAdornment}
          contentHeader={props.contentHeader}
          footer={props.footer}
        >
          {formContent}
        </FormScrollNavLayout>
      ) : (
        formContent
      )}
    </FormOptionsContext.Provider>
  );
}
