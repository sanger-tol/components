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
  FormMarkdown,
  FormDatetime,
  MultipleFormInput,
  deepestEqual,
  normaliseCaps,
  FormComponentWrapper,
  FormTextArea,
  READ_ONLY_FIELD_PLACEHOLDER,
  FormScrollNavLayout,
  getNavGroups,
  resolveScrollNavConfig,
  withFieldAnchorIds,
  getFieldStatus,
  getValueAtPath,
  isEmptyFieldValue,
  isRecord,
  FormOptionsContext,
  FormToggle,
  FormDrawer,
  setValueAtPath,
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
  IFormTagField,
  IFormValueSource,
  ISubformDrawerState,
  ISubformField,
  IToggleFormField,
  TFormFieldPath,
  TFormValuePath,
} from "..";
import { FormTags } from "./FormTags";

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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchError, setSearchError] = useState<string>("");
  const [searching, setSearching] = useState<boolean>(false);
  const [showFields, setShowFields] = useState<boolean>(!searchConfig);
  const [subformDrawerOpen, setSubformDrawerOpen] = useState(false);
  const [subformDrawerState, setSubformDrawerState] =
    useState<ISubformDrawerState | null>(null);
  const [subformDrawerDraft, setSubformDrawerDraft] =
    useState<Record<string, unknown> | null>(null);
  const [expandedSubformItems, setExpandedSubformItems] = useState<
    Record<string, boolean>
  >({});
  const [formId, _] = useState<any>(() => crypto.randomUUID());
  const hasUnsavedChanges = useRef(false);
  const initialSnapshotRef = useRef<Record<string, any>>({});
  const onUnsavedChangesRef = useRef(props.onUnsavedChanges);

  const formRef = useRef<any>(null);
  const defaultModel = Schema.Model({});
  const formLocked = formConfig.options?.locked ?? false;
  const scrollNav = resolveScrollNavConfig(formConfig.options?.scrollNav);
  const fields = scrollNav
    ? withFieldAnchorIds(formConfig.fields, scrollNav.key)
    : formConfig.fields;
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

  // Updates a nested field and tracks changes under its top-level field.
  const handleFieldInputChange = (path: TFormFieldPath, value: unknown) => {
    const [fieldName] = path;

    setFormData((previousData) =>
      setValueAtPath(previousData, path, value),
    );
    setModifiedFields((prev: any) => {
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
        const { [fieldName]: _, ...rest } = prev as any;
        return rest;
      }
      return { ...prev, [fieldName]: updatedFieldValue };
    });
  };

  // Keeps the existing change interface for top-level form controls.
  const handleInputChange = (name: string, value: any) => {
    handleFieldInputChange([name], value);
  };

  const handleSearch = () => {
    const query = searchQuery.trim();
    setSearchError("");

    if (!query) {
      setSearchError(
        searchConfig?.emptySearchMessage ?? "Enter a search term.",
      );
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

  const fieldStatus = (
    field: TFormField,
    value: unknown,
    error?: string,
  ) =>
    getFieldStatus(field, value, {
      formLocked,
      sectionLocked: sectionsById.get(field.section ?? "")?.locked === true,
      error,
    });

  // Counts the editable leaf fields used to decide whether auto mode needs a drawer.
  const countSubformFields = (subformFields: TFormField[]): number =>
    subformFields.reduce(
      (count, subformField) =>
        count +
        (subformField.type === "subform"
          ? countSubformFields(subformField.fields)
          : 1),
      0,
    );

  // Opens an item in a detached form-data snapshot so edits stay drafts until saved.
  const openSubformDrawer = (
    field: ISubformField,
    path: TFormFieldPath,
    itemIndex?: number,
  ) => {
    const currentItems = getValueAtPath(formData, path);
    const items = Array.isArray(currentItems) ? currentItems : [];
    const isNew =
      field.multiple
        ? itemIndex === undefined
        : !isRecord(currentItems);
    let draftData: Record<string, unknown>;
    let initialValue: unknown;

    if (field.multiple) {
      const nextItem =
        itemIndex === undefined
          ? createInitialDataSnapshot({ fields: field.fields })
          : items[itemIndex];
      const nextIndex = itemIndex ?? items.length;
      const nextItems =
        itemIndex === undefined ? [...items, nextItem] : items;

      draftData = setValueAtPath(formData, path, nextItems);
      initialValue = isNew ? undefined : nextItem;
      itemIndex = nextIndex;
    } else {
      initialValue = currentItems;
      const objectValue = isRecord(currentItems)
        ? currentItems
        : createInitialDataSnapshot({ fields: field.fields });
      draftData = setValueAtPath(formData, path, objectValue);
    }

    setSubformDrawerDraft(draftData);
    setSubformDrawerState({
      field,
      path,
      itemIndex,
      isNew,
      initialValue,
    });
    setSubformDrawerOpen(true);
  };

  // Commits the active draft to the live form data.
  const saveSubformDrawer = () => {
    if (!subformDrawerState || !subformDrawerDraft) return;

    const { field, isNew, itemIndex, path } = subformDrawerState;

    if (!field.multiple) {
      handleFieldInputChange(path, getValueAtPath(subformDrawerDraft, path));
    } else if (itemIndex === undefined) {
      return;
    } else if (isNew) {
      const item = getValueAtPath(subformDrawerDraft, [...path, itemIndex]);
      const currentItems = getValueAtPath(formData, path);
      handleFieldInputChange(path, [
        ...(Array.isArray(currentItems) ? currentItems : []),
        item,
      ]);
    } else {
      const item = getValueAtPath(subformDrawerDraft, [...path, itemIndex]);
      handleFieldInputChange([...path, itemIndex] as TFormFieldPath, item);
    }

    setSubformDrawerOpen(false);
    setSubformDrawerState(null);
    setSubformDrawerDraft(null);
  };

  // Drops the active draft without changing the live form data.
  const discardSubformDrawer = () => {
    setSubformDrawerOpen(false);
    setSubformDrawerState(null);
    setSubformDrawerDraft(null);
  };

  // Expands or collapses an inline summary card for editing.
  const setSubformItemExpanded = (
    path: TFormFieldPath,
    expanded: boolean,
  ) => {
    setExpandedSubformItems((current) => ({
      ...current,
      [path.join(".")]: expanded,
    }));
  };

  // Clears expanded cards for a list, since removing an item shifts indexes.
  const resetSubformItemsExpanded = (path: TFormFieldPath) => {
    const listKey = `${path.join(".")}.`;

    setExpandedSubformItems((current) =>
      Object.fromEntries(
        Object.entries(current).filter(([key]) => !key.startsWith(listKey)),
      ),
    );
  };

  const subformDrawerSource: IFormValueSource | undefined =
    subformDrawerDraft === null
      ? undefined
      : {
          data: subformDrawerDraft,
          onChange: (path, value) =>
            setSubformDrawerDraft((previousDraft) =>
              previousDraft
                ? setValueAtPath(previousDraft, path, value)
                : previousDraft,
            ),
        };

  const isReadOnlyStatus = (status: ReturnType<typeof fieldStatus>) =>
    status === "locked" || status === "auto";

  const isFieldReadOnly = (field: TFormField) =>
    isReadOnlyStatus(
      fieldStatus(field, formData[field.name], formErrors[field.name]),
    );

  // Repeatable subforms manage their own array, so only other multiple fields use MultipleFormInput
  const usesMultipleFormInput = (field: TFormField) =>
    Boolean(field.multiple) && field.type !== "subform";

  // Renders a field against the live form data, or another source such as a drawer draft
  const renderField = (
    field: TFormField,
    parentPath: TFormValuePath = [],
    parentReadOnly = false,
    source: IFormValueSource = {
      data: formData,
      onChange: handleFieldInputChange,
    },
  ) => {
    if (!field) {
      return null;
    }

    const containingData =
      parentPath.length === 0
        ? source.data
        : getValueAtPath(source.data, parentPath);
    if (
      field.hiddenWhen?.(
        isRecord(containingData) ? containingData : source.data,
      )
    ) {
      return null;
    }

    const fieldPath: TFormFieldPath = [
      ...parentPath,
      field.name,
    ] as TFormFieldPath;
    const fieldValue =
      parentPath.length === 0
        ? source.data[field.name]
        : getValueAtPath(source.data, fieldPath);
    const setFieldValue = (value: unknown) => source.onChange(fieldPath, value);
    const errorKey =
      parentPath.length === 0 ? field.name : fieldPath.join(".");
    const errorText: string | undefined = formErrors[errorKey];
    const status = fieldStatus(field, fieldValue, errorText);
    const readOnly = parentReadOnly || isReadOnlyStatus(status);
    const placeholder =
      status === "locked" && isEmptyFieldValue(fieldValue)
        ? READ_ONLY_FIELD_PLACEHOLDER
        : field.placeholder;
    const controlId =
      parentPath.length === 0
        ? formId
        : `${formId}-${fieldPath.map(String).join("-")}`;

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
            onChange={(value: any) =>
              setFieldValue(value)
            }
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
              onChange={(value: any) =>
                setFieldValue(value)
              }
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
            setValue={(value: any) =>
              setFieldValue(value)
            }
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
              onChange={(value: any) =>
                setFieldValue(value)
              }
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
              onChange={(value: any) =>
                setFieldValue(value)
              }
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
              multipleselectField.disabledWhen?.(formData),
            )}
            readOnly={readOnly}
            placeholder={placeholder}
            value={
              Array.isArray(multipleSelectValue) ? multipleSelectValue : []
            }
            setValue={(value: any) =>
              setFieldValue(value)
            }
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
            onChange={(value: any) =>
              setFieldValue(value)
            }
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
            setValue={(value: any) =>
              setFieldValue(value)
            }
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
            setValue={(value: readonly string[]) =>
              setFieldValue([...value])
            }
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
            onChange={(value: boolean) =>
              setFieldValue(value)
            }
            errorText={errorText}
          />
        );
      case "checkbox":
        const checkboxField = field as ICheckboxFormField;
        const { defaultChecked, ...checkboxProps } = checkboxField;
        const hasInitialValue =
          getValueAtPath(initialData, fieldPath) !== undefined;
        return (
          <FormCheckboxes
            {...(hasInitialValue ? checkboxProps : checkboxField)}
            id={`${controlId}-checkbox`}
            readOnly={readOnly}
            checkedItems={fieldValue ?? []}
            setCheckedItems={(value: any) =>
              setFieldValue(value)
            }
            errorText={errorText}
          />
        );
      case "subform": {
        const subformField = field as ISubformField;
        const subformItems = Array.isArray(fieldValue) ? fieldValue : [];
        const minimumItems = Math.max(
          subformField.minItems ?? 0,
          subformField.required ? 1 : 0,
        );
        const canAddItems =
          subformField.maxItems === undefined ||
          subformItems.length < subformField.maxItems;
        const itemLabel =
          subformField.itemLabel ?? subformField.label ?? "Item";
        const presentation = subformField.editor?.presentation ?? "inline";
        const useDrawer =
          presentation === "drawer" ||
          (presentation === "auto" &&
            countSubformFields(subformField.fields) >
              (subformField.editor?.drawerThreshold ?? 5));

        // Builds a readable card heading from the configured summary fields.
        const getItemSummary = (item: unknown, index: number) => {
          const summary = (subformField.summaryFields ?? [])
            .map((path) => getValueAtPath(item, path.split(".")))
            .filter(
              (value): value is string | number =>
                typeof value === "string" || typeof value === "number",
            )
            .map(String)
            .filter(Boolean)
            .join(" · ");

          return summary || `${itemLabel} ${index + 1}`;
        };

        return (
          <FormComponentWrapper
            {...subformField}
            id={controlId}
            readOnly={readOnly}
            value={
              subformField.multiple
                ? subformItems
                : isRecord(fieldValue)
                  ? fieldValue
                  : {}
            }
            errorText={errorText}
          >
            {subformField.multiple ? (
              useDrawer ? (
                <div className="tol-form-subform-fields tol-form-subform-list tol-form-subform-cards">
                  {subformItems.map((item, index) => (
                    <div className="tol-form-subform-item" key={index}>
                      <div className="tol-form-subform-card-title">
                        {getItemSummary(item, index)}
                      </div>
                      {!readOnly && (
                        <div className="tol-form-subform-item-actions">
                          <Button
                            type="warning"
                            icon="edit"
                            text={`Edit ${itemLabel}`}
                            onClick={() =>
                              openSubformDrawer(
                                subformField,
                                fieldPath,
                                index,
                              )
                            }
                          />
                          <Button
                            type="error"
                            outline
                            icon="trash"
                            text={`Remove ${itemLabel}`}
                            disabled={subformItems.length <= minimumItems}
                            onClick={() =>
                              setFieldValue(
                                subformItems.filter(
                                  (_item, itemIndex) => itemIndex !== index,
                                ),
                              )
                            }
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  {!readOnly && (
                    <div className="tol-form-subform-list-actions">
                      <Button
                        icon="plus"
                        position="left"
                        text={`Add ${itemLabel}`}
                        disabled={!canAddItems}
                        onClick={() =>
                          openSubformDrawer(subformField, fieldPath)
                        }
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className={`tol-form-subform-fields tol-form-subform-list${
                    subformField.summary ? " tol-form-subform-cards" : ""
                  }`}
                >
                  {subformItems.map((item, index) => {
                    const itemPath = [...fieldPath, index];
                    const showSummaryCard =
                      subformField.summary &&
                      !expandedSubformItems[itemPath.join(".")];

                    return (
                      <div className="tol-form-subform-item" key={index}>
                        {showSummaryCard ? (
                          <div className="tol-form-subform-card-title">
                            {getItemSummary(item, index)}
                          </div>
                        ) : (
                          subformField.fields.map((nestedField) => (
                            <div key={nestedField.name}>
                              {renderField(
                                nestedField,
                                itemPath,
                                readOnly,
                                source,
                              )}
                            </div>
                          ))
                        )}
                        {!readOnly && (
                          <div className="tol-form-subform-item-actions">
                            {subformField.summary &&
                              (showSummaryCard ? (
                                <Button
                                  type="warning"
                                  icon="edit"
                                  text={`Edit ${itemLabel}`}
                                  onClick={() =>
                                    setSubformItemExpanded(itemPath, true)
                                  }
                                />
                              ) : (
                                <Button
                                  icon="check"
                                  text="Done"
                                  disabled={isEmptyFieldValue(item)}
                                  onClick={() =>
                                    setSubformItemExpanded(itemPath, false)
                                  }
                                />
                              ))}
                            <Button
                              type="error"
                              outline
                              icon="trash"
                              text={`Remove ${itemLabel}`}
                              disabled={subformItems.length <= minimumItems}
                              onClick={() => {
                                resetSubformItemsExpanded(fieldPath);
                                setFieldValue(
                                  subformItems.filter(
                                    (_item, itemIndex) => itemIndex !== index,
                                  ),
                                );
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {!readOnly && (
                    <div className="tol-form-subform-list-actions">
                      <Button
                        icon="plus"
                        position="left"
                        text={`Add ${itemLabel}`}
                        disabled={!canAddItems}
                        onClick={() => {
                          if (subformField.summary) {
                            setSubformItemExpanded(
                              [...fieldPath, subformItems.length],
                              true,
                            );
                          }

                          setFieldValue([
                            ...subformItems,
                            createInitialDataSnapshot({
                              fields: subformField.fields,
                            }),
                          ]);
                        }}
                      />
                    </div>
                  )}
                </div>
              )
            ) : useDrawer && !readOnly ? (
              <div className="tol-form-subform-single-drawer">
                <Button
                  type="warning"
                  icon="edit"
                  text={`Edit ${itemLabel}`}
                  onClick={() => openSubformDrawer(subformField, fieldPath)}
                />
              </div>
            ) : (
              <div className="tol-form-subform-fields">
                {subformField.fields.map((nestedField) => (
                  <div key={nestedField.name}>
                    {renderField(nestedField, fieldPath, readOnly, source)}
                  </div>
                ))}
              </div>
            )}
          </FormComponentWrapper>
        );
      }
      default:
        return null;
    }
  };

  const uniqueSections = Array.from(
    new Set(fields.map((field) => field.section)),
  )
    .filter((section) => section !== undefined)
    .map((section) => section as string);
  const inlineLabels = formConfig.options?.inlineLabels ?? false;
  const activeSubformDraftItem =
    subformDrawerState && subformDrawerDraft
      ? getValueAtPath(
          subformDrawerDraft,
          subformDrawerState.itemIndex === undefined
            ? subformDrawerState.path
            : [
                ...subformDrawerState.path,
                subformDrawerState.itemIndex,
              ],
        )
      : undefined;
  const subformDrawerHasPendingChanges = Boolean(
    subformDrawerState &&
      (subformDrawerState.isNew ||
        !deepestEqual(
          activeSubformDraftItem,
          subformDrawerState.initialValue ?? null,
        )),
  );

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
              const sectionLocked =
                !formLocked && sectionConfig?.locked === true;

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
                              {" "}
                              <em>Optional</em>
                            </span>
                          )
                        )}
                      </h5>
                    </div>
                    {fields
                      .filter((field) => field.section === section)
                      .map((field: any) => (
                        <div
                          key={`${field.id ?? formId}-${field.name}`}
                          id={usesMultipleFormInput(field) ? field.id : undefined}
                        >
                          {usesMultipleFormInput(field) ? (
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
                              id={field.id}
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
            {fields.some((field) => !field.section) && (
              <div
                key="section-misc"
                id="section-misc"
                className="tol-form-wrapper-unique-sections-container"
              >
                <div className="tol-form-wrapper-unique-sections-header">
                  <h5>{normaliseCaps("Misc")}</h5>
                </div>
                {fields
                  .filter((field) => !field.section)
                  .map((field: any) => (
                    <div
                      key={`${formId}-${field.name}`}
                      id={usesMultipleFormInput(field) ? field.id : undefined}
                    >
                      {usesMultipleFormInput(field) ? (
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
                          id={field.id}
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
          fields.map((field: any) => (
            <div
              key={`${formId}-${field.name}`}
              id={usesMultipleFormInput(field) ? field.id : undefined}
            >
              {usesMultipleFormInput(field) ? (
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
                  id={field.id}
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
                      isValid = validateForm(formRef, formData, props.onSubmit);
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
      {subformDrawerState && subformDrawerDraft && subformDrawerSource && (
        <FormDrawer
          open={subformDrawerOpen}
          setOpen={setSubformDrawerOpen}
          title={`${subformDrawerState.isNew ? "Add" : "Edit"} ${
            subformDrawerState.field.itemLabel ??
            subformDrawerState.field.label ??
            "Item"
          }`}
          hasPendingChanges={subformDrawerHasPendingChanges}
          onSave={saveSubformDrawer}
          onDiscard={discardSubformDrawer}
        >
          <div className="tol-form-subform-fields">
            {subformDrawerState.field.fields.map((nestedField) => (
              <div key={nestedField.name}>
                {renderField(
                  nestedField,
                  subformDrawerState.itemIndex === undefined
                    ? subformDrawerState.path
                    : [
                        ...subformDrawerState.path,
                        subformDrawerState.itemIndex,
                      ],
                  isFieldReadOnly(subformDrawerState.field),
                  subformDrawerSource,
                )}
              </div>
            ))}
          </div>
        </FormDrawer>
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
                  scrollNav.showStatus === false ? undefined : fieldStatus,
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
