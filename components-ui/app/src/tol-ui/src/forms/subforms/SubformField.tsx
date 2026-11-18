/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  Button,
  FormComponentWrapper,
  countSubformFields,
  createInitialDataSnapshot,
  getValueAtPath,
  isEmptyFieldValue,
  isRecord,
  DEFAULT_DRAWER_THRESHOLD_LIMIT,
} from "../..";
import type {
  IFormValueSource,
  ISubformControls,
  ISubformField,
  TFormFieldPath,
  TRenderFormField,
} from "../..";

/** Props for a subform field. */
export interface PSubformField {
  /** The subform's config. */
  field: ISubformField;
  /** Path to the subform's value. */
  path: TFormFieldPath;
  /** The subform's current value: an array when `multiple`, otherwise an object. */
  value: unknown;
  /** Id for the subform's wrapper. */
  controlId: string;
  /** Whether the subform and its fields are read-only. */
  readOnly: boolean;
  /** Validation error for the subform. */
  errorText?: string;
  /** Where nested fields read and write their values. */
  source: IFormValueSource;
  /** Replaces the subform's whole value. */
  onChange: (value: unknown) => void;
  /** Renders the subform's nested fields. */
  renderField: TRenderFormField;
  /** Drawer and summary-card actions. */
  controls: ISubformControls;
}

// Renders a nested object or list as inline fields, summary cards or drawer cards.
export function SubformField(props: PSubformField) {
  const {
    controlId,
    controls,
    errorText,
    field,
    onChange,
    path,
    readOnly,
    renderField,
    source,
    value,
  } = props;

  const items: unknown[] = Array.isArray(value) ? value : [];
  const minimumItems = Math.max(field.minItems ?? 0, field.required ? 1 : 0);
  const canAddItems =
    field.maxItems === undefined || items.length < field.maxItems;
  const canRemoveItems = items.length > minimumItems;
  const itemLabel = field.itemLabel ?? field.label ?? "Item";

  const presentation = field.editor?.presentation ?? "inline";
  const useDrawer =
    presentation === "drawer" ||
    (presentation === "auto" &&
      countSubformFields(field.fields) >
        (field.editor?.drawerThreshold ?? DEFAULT_DRAWER_THRESHOLD_LIMIT));

  // Builds a readable card heading from the configured summary fields.
  const getItemSummary = (item: unknown, index: number) => {
    const summary = (field.summaryFields ?? [])
      .map((summaryPath) => getValueAtPath(item, summaryPath.split(".")))
      .filter(
        (summaryValue): summaryValue is string | number =>
          typeof summaryValue === "string" || typeof summaryValue === "number",
      )
      .map(String)
      .filter(Boolean)
      .join(" · ");

    return summary || `${itemLabel} ${index + 1}`;
  };

  // Renders every nested field against the record at `recordPath`.
  const renderNestedFields = (recordPath: TFormFieldPath) =>
    field.fields.map((nestedField) => (
      <div key={nestedField.name}>
        {renderField(nestedField, recordPath, readOnly, source)}
      </div>
    ));

  const removeItem = (index: number) => {
    controls.removeItem(path, index);
    onChange(items.filter((_item, itemIndex) => itemIndex !== index));
  };

  const removeButton = (index: number) => (
    <Button
      type="error"
      outline
      icon="trash"
      text={`Remove ${itemLabel}`}
      disabled={!canRemoveItems}
      onClick={() => removeItem(index)}
    />
  );

  const addButton = (onClick: () => void) =>
    !readOnly && (
      <div className="tol-form-subform-list-actions">
        <Button
          icon="plus"
          position="left"
          text={`Add ${itemLabel}`}
          disabled={!canAddItems}
          onClick={onClick}
        />
      </div>
    );

  const renderDrawerCards = () => (
    <div className="tol-form-subform-fields tol-form-subform-list tol-form-subform-cards">
      {items.map((item, index) => (
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
                onClick={() => controls.openDrawer(field, path, index)}
              />
              {removeButton(index)}
            </div>
          )}
        </div>
      ))}

      {addButton(() => controls.openDrawer(field, path))}
    </div>
  );

  const renderInlineList = () => (
    <div
      className={`tol-form-subform-fields tol-form-subform-list${
        field.summary ? " tol-form-subform-cards" : ""
      }`}
    >
      {items.map((item, index) => {
        const itemPath: TFormFieldPath = [...path, index];
        // Empty items stay open, since there's nothing to summarise yet
        const showSummaryCard =
          field.summary &&
          !isEmptyFieldValue(item) &&
          !controls.isItemExpanded(itemPath);

        return (
          <div className="tol-form-subform-item" key={index}>
            {showSummaryCard ? (
              <div className="tol-form-subform-card-title">
                {getItemSummary(item, index)}
              </div>
            ) : (
              renderNestedFields(itemPath)
            )}

            {!readOnly && (
              <div className="tol-form-subform-item-actions">
                {field.summary &&
                  (showSummaryCard ? (
                    <Button
                      type="warning"
                      icon="edit"
                      text={`Edit ${itemLabel}`}
                      onClick={() => controls.setItemExpanded(itemPath, true)}
                    />
                  ) : (
                    <Button
                      icon="check"
                      text="Done"
                      disabled={isEmptyFieldValue(item)}
                      onClick={() => controls.setItemExpanded(itemPath, false)}
                    />
                  ))}
                {removeButton(index)}
              </div>
            )}
          </div>
        );
      })}

      {addButton(() => {
        if (field.summary) {
          controls.setItemExpanded([...path, items.length], true);
        }

        onChange([
          ...items,
          createInitialDataSnapshot({ fields: field.fields }),
        ]);
      })}
    </div>
  );

  const renderSingle = () =>
    useDrawer && !readOnly ? (
      <div className="tol-form-subform-single-drawer">
        <Button
          type="warning"
          icon="edit"
          text={`Edit ${itemLabel}`}
          onClick={() => controls.openDrawer(field, path)}
        />
      </div>
    ) : (
      <div className="tol-form-subform-fields">{renderNestedFields(path)}</div>
    );

  return (
    <FormComponentWrapper
      {...field}
      id={controlId}
      readOnly={readOnly}
      value={field.multiple ? items : isRecord(value) ? value : {}}
      errorText={errorText}
    >
      {!field.multiple
        ? renderSingle()
        : useDrawer
          ? renderDrawerCards()
          : renderInlineList()}
    </FormComponentWrapper>
  );
}
