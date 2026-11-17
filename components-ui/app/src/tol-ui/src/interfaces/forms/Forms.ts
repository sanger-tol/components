/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type React from "react";
import type {
  IFormScrollNavConfig,
  ISubformControls,
  PButton,
  TFieldNavStatus,
  TFormField,
  TFormFieldPath,
  TRenderFormField,
} from "../..";

/** Optional behavior and presentation settings shared by a form's fields. */
export interface IFormOptions {
  /** Whether to display form labels inline with their fields. */
  inlineLabels?: boolean;
  /** Whether to display required fields as text instead of using an asterisk. */
  requiredAsText?: boolean;
  /** Prevent editing all fields while retaining their values. */
  locked?: boolean;
  /** Optional on-page scroll navigation for form sections and grouped fields. */
  scrollNav?: boolean | IFormScrollNavConfig;
}

/** A group of fields, optionally marked as locked or optional. */
export type IFormSection = {
  /** Section identifier referenced by each field's `section` property. */
  id: string;
  /** Display label. Defaults to a normalized version of the section ID. */
  label?: string;
} & (
  | { locked: true; optional?: false }
  | { optional: true; locked?: false }
  | { locked?: false; optional?: false }
);

/** Buttons rendered after the configured form fields. */
export interface IFormButtons {
  /** Buttons to render, in display order. */
  buttons: PButton[];
  /** Inline style applied to the button container. */
  buttonStyle?: React.CSSProperties;
}

/** Complete field, section and action configuration for a form. */
export interface IFormConfig {
  /** Fields rendered by the form. */
  fields: TFormField[];
  /** Optional section definitions referenced by fields' `section` values. */
  sections?: IFormSection[];
  /** Optional buttons rendered after the fields. */
  buttonConfig?: IFormButtons;
  /** Optional form-wide presentation and behavior settings. */
  options?: IFormOptions;
}

/** Optional search-first controls for forms that can prefill their fields from a lookup. */
export interface IFormSearchConfig<TResult extends object> {
  /** Label for the search input. */
  searchLabel: string;
  /** Placeholder shown in the search input. */
  searchPlaceholder: string;
  /** Text for the search action. */
  searchButtonText: string;
  /** Text for the action that reveals the editable fields without a lookup. */
  manualEntryButtonText: string;
  /** Message shown when search is submitted with an empty query. */
  emptySearchMessage: string;
  /** Fallback message shown when lookup rejects without a useful error. */
  searchErrorMessage: string;
  /** Performs the lookup and returns values to merge into the form. */
  onSearch: (query: string) => Promise<TResult>;
  /** Receives successful lookup results. */
  onSearchResult?: (result: TResult) => void;
  /** Called when the user chooses manual entry. */
  onManualEntry?: () => void;
  /** Reports when an asynchronous lookup starts and finishes. */
  onSearchStateChange?: (searching: boolean) => void;
}

/** Maps a value from one form field to another, optionally transforming it. */
export interface IFieldMapping {
  /** Source field name in the input data. */
  sourceField: string;
  /** Destination field name in the form data. */
  targetField: string;
  /** Prevents mapping unless the source value satisfies this predicate. */
  condition?: (value: any) => boolean;
  /** Transforms the source value before assigning it to the destination. */
  transform?: (value: any) => any;
  /** Marks the destination field read-only when this mapping is applied. */
  readOnlyWhenMapped?: boolean;
}

/** Where rendered fields read and write their values, such as live form data or a drawer draft. */
export interface IFormValueSource {
  /** Data that field paths are resolved against. */
  data: Record<string, unknown>;
  /** Called with a field's full path and its new value. */
  onChange: (path: TFormFieldPath, value: unknown) => void;
}

/** Everything `renderFormField` needs from the form that owns the field. */
export interface IFormFieldContext {
  /** Unique id of the form, used to build control ids. */
  formId: string;
  /** Live form data, passed to callbacks such as `disabledWhen`. */
  formData: Record<string, any>;
  /** Validation errors keyed by field name, or dotted path for nested fields. */
  formErrors: Record<string, string | undefined>;
  /** Default value source: the live form data and its change handler. */
  source: IFormValueSource;
  /** Data the form was opened with, used for checkbox defaults. */
  initialData?: object;
  /** Works out a field's status from its value and error. */
  getStatus: (
    field: TFormField,
    value: unknown,
    error?: string,
  ) => TFieldNavStatus;
  /** Renders nested fields, such as those inside a subform. */
  renderField: TRenderFormField;
  /** Subform drawer and summary-card actions. */
  subforms: ISubformControls;
}
