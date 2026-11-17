/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from "react";
import type { TagInputProps } from "rsuite";
import type {
  TMessageType,
  PButton,
  TsDataSource,
  PIcon,
  TTextEditorButtons,
  TFormLabelIconPosition,
  TCheckboxFields,
  TFormField,
  TFormFieldPath,
  TLabelAndValueData,
} from "../..";
import type { IEditorOptions } from "../../text-editor/TextEditor";

/** Config for the dropzone waiting message */
export interface IWaitingUpload {
  /**
   * The message to display while waiting for the upload to complete.
   */
  message: string | React.ReactNode;
}


/** Config for the message displayed in the form */
export interface IMessage {
  /**
   * The type of message. Can be "success", "info", "warning", or "error".
   */
  type: string;
  /**
   * The message to display. Can be a string or a React node.
   */
  message: TMessageType;
}

/** Config for the file data used in the form dropzone component */
export interface IFileData {
  /** The file object representing the uploaded file. */
  blobFile: File;
  /** The unique key for the uploaded file. */
  fileKey: string;
  /** The name of the uploaded file. */
  name: string;
  /** The status of the uploaded file. */
  status: string;
}

/** Config for the data used in a multiple select form field */
export interface IMultiSelectData {
  /** The label for the multiple select option. */
  label: string;
  /** The value for the multiple select option. */
  value: string;
}

/** Config for a checkbox form field component */
export interface ICheckboxField {
  /** Whether the checkbox is disabled. If true, the user cannot interact with the checkbox. */
  disabled?: boolean;
  /** The default checked state of the checkbox. */
  defaultChecked?: boolean;
  /** The value associated with the checkbox. */
  value: string;
  /** The content to be displayed next to the checkbox. */
  children: React.ReactNode;
  /** The CSS styles to apply to the checkbox component. */
  style?: React.CSSProperties;
  /** The subtext to display below the checkbox label. */
  subtext?: string;
}

/** Config for the checkbox form field configuration */
export interface ICheckboxConfig {
  /** The fields configuration for the checkbox form field. */
  fields: TCheckboxFields;
}

/** Config for the form label icon */
export interface IFormLabelIcon extends PIcon {
  /** The position of the form label icon. */
  position?: TFormLabelIconPosition;
}

/** Config for a generic form component */
export interface IFormComponent {
  /** The unique identifier for the form field. */
  id?: string;
  /** The name of the form field. This is used to identify the field in the form data. */
  name: string;
  /** The type of form field. This determines the kind of input element that will be rendered. */
  type: TFormField["type"];
  /** The label for the form field. This is displayed above the input element. */
  label?: string;
  /** The help text for the form field. This is displayed below the input element. */
  helpText?: string;
  /** The placeholder text for the form field. This is displayed inside the input element when it is empty. */
  placeholder?: string;
  /** Whether the form field is read-only. If true, the user cannot modify the value of the field. */
  readOnly?: boolean;
  /** Marks a field as generated automatically. */
  automatic?: boolean;
  /** Shows a Recommended subtitle when the field is editable and not automatic. */
  recommended?: boolean;
  /**
   * Whether the form field is required. If true, the user must provide a value for the field before submitting the form.
   * This will also display a red asterisk next to the label.
   */
  required?: boolean;
  /** Hides this field when the predicate returns true for its containing object. */
  hiddenWhen?: (formData: Record<string, any>) => boolean;
  /** Whether the form field is centered. If true, the label and input element will be centered. */
  centered?: boolean;
  /** The icon for the form field label. This is displayed next to the label. */
  icon?: IFormLabelIcon;
  /**
   * Whether the form field label is displayed inline with the input element.
   * If true, the label will be displayed to the left of the input element.
   */
  labelInline?: boolean;
  /** The section of the form that this field belongs to. This can be used to group related fields together.
   */
  section?: string;
  /**
   * Whether multiple of a particular form field should be allowed. 
   * If true, the user can add multiple instances of this field.
   */
  multiple?: boolean;
  /** Callback function triggered when the minus button is clicked for a multiple field. */
  onMinus?: (inputId: string, value: any, remove: () => void) => void;
  /**
   * Whether at least one instance of a particular form field is required.
   * If true, the user must provide at least one instance of this field before submitting the form.
   */
  minOne?: boolean;
  /** Creates an optional action button for each row of a multiple field. */
  rowButton?: (inputId: string, value: any) => PButton;
  /** Whether the required field should display the required text instead of the asterisk. */
  requiredAsText?: boolean;
}

/** Text field component interface */
export interface ITextField extends IFormComponent {
  /** The type of the text field. */
  type: "text";
  /** The placeholder text for the text field. */
  accepter?: React.ReactNode;
}

/** Email field component interface */
export interface IEmailField extends Omit<ITextField, "type"> {
  type: "email";
}

/** Password field component interface */
export interface IPasswordField extends Omit<ITextField, "type"> {
  type: "password";
}

/** Country select field component interface */
export interface ICountryselectField extends IFormComponent {
  type: "countryselect";
}

/** Datetime field component interface */
export interface IDatetimeField extends IFormComponent {
  type: "datetime";
  hideMinutes?: (minute: number, date: Date) => boolean;
  format?: string;
}

/** Label and value data instance interface */
export interface ILabelAndValueDataInstance {
  label: string;
  value: any;
  [otherParams: string]: any;
}
/** Single select field component interface */
export interface ISingleselectField extends IFormComponent {
  type: "singleselect";
  data: string[] | TLabelAndValueData; // Array of selectable options
  block?: boolean;
  disabled?: boolean;
}

/** Single select custom option field component interface */
export interface ISingleselectcustomoptionField extends IFormComponent {
  type: "singleselectcustomoption";
  data: string[];
  customOptionPlaceholder?: string;
}

/** Form tag field component interface */
export interface IFormTagField extends Omit<IFormComponent, "children" | "value"> {
  type: "tag";
  inputProps?: TagInputProps;
  value?: string[];
  errorText?: string;
}

/** Dropzone field component interface */
export interface IDropzoneField extends IFormComponent {
  type: "dropzone";
  resource: string;
  dataSource: TsDataSource;
  fileType: string;
  generateMessages?: (apiRes: any) => IMessage[];
  setResponse?: any;
  onFileDrop?: (length: boolean) => void;
  fileListVisible?: boolean;
  fileList?: IFileData[];
  setFileList?: (fileList: IFileData[]) => void;
  parentToSubmit?: boolean;
  resetKey?: string | number;
  validating?: boolean;
}

/** Autocomplete field component interface */
export interface IAutocompleteField extends IFormComponent {
  type: "autocomplete";
  label: string;
  data: string[];
  dataSource?: TsDataSource; // Exists if this is a RemoteAutoComplete field
}

/** Multiple select field component interface */
export interface IMultipleselectField extends IFormComponent {
  /* Whether the multiple select field should stick to the top when scrolling. */
  type: "multipleselect";
  /* Whether the multiple select field should be displayed as a block element. */
  sticky?: boolean;
  /* The data for the multiple select field, either an array of strings or an array of IData objects. */
  block?: boolean;
  /** The options for the multiple select field. */
  data: string[] | IMultiSelectData[];
  /** Placeholder text for the multiple select field. */
  placeholder?: string;
  /* Whether the multiple select field should be disabled. */
  disabled?: boolean;
  /* Function to determine if the multiple select field should be disabled based on the form data. */
  disabledWhen?: (formData: Record<string, any>) => boolean;
  /* Whether the multiple select field is currently loading. */
  loading?: boolean;
  /* Whether the multiple select field is currently open. */
  open?: boolean;
  /* The datasource for fetching actions.
   * Function to be called when the multiple select field is opened. */
  onOpen?: any;
  /* Function to be called when the multiple select field is entering. */
  onEntering?: any;
  /* Function to be called when the multiple select field is closed. */
  onClose?: any;
  /* Function to be called when the multiple select field is cleaned. */
  onClean?: any;
  /* Function to be called when the multiple select field is clicked. */
  onClick?: any;
  /* Function to render each menu item in the multiple select field. */
  renderMenuItem?: any;
  /* Function to render the selected value in the multiple select field. */
  renderValue?: any;
  /* Whether the multiple select field should have a search input. */
  noSearch?: boolean;
  /* Whether the multiple select field should have a "Select All" option. */
  noSelectAll?: boolean;
  /* The label for the multiple select field. */
  label?: string;
  /* The values of the items that should be disabled in the multiple select field. */
  disabledItemValues?: string[];
  /* Function to determine if an item should be included in the search results. */
  searchBy?: (keyword: string, label: any, item: any) => boolean;
  /* The caret element for the multiple select field. */
  caretAs?: any;
  /* Function to render extra footer content in the multiple select field. */
  renderExtraFooter?: any;
  /* The CSS class name for the multiple select field. */
  className?: string;
  /* Function to be called when the multiple select field is exiting. */
  onExit?: any;
  /* Function to be called when the multiple select field is exiting. */
  onExiting?: any;
  /* The datasource for fetching actions. */
  groupBy?: string;
  /* The property by which to group the items in the multiple select field. */
}

export interface IMarkdownField extends IFormComponent {
  type: "markdown";
  preview?: boolean;
  removeCommands?: string[];
  height?: string | number;
}

export interface ITextAreaField extends IFormComponent {
  type: "textarea";
  options?: IEditorOptions;
  menuButtons?: TTextEditorButtons;
  errorText?: string;
  returnValueType?: "html" | "json" | "text";
  customExtensions?: any[];
  customButtons?: any[];
  keyboardShortcutElement?: React.ReactNode;
  editable?: boolean;
  height?: string | number;
  onEditorChange?: (editor: any) => void;
}
export interface ICheckboxFormField extends IFormComponent {
  type: "checkbox";
  label: string;
  checkboxConfig: ICheckboxConfig;
  hidden?: boolean;
  inline?: boolean;
  indeterminate?: boolean;
  defaultChecked?: string[];
}

export interface IFormScrollNavConfig {
  /** Defaults to `true` when a config object is supplied. */
  enabled?: boolean;
  /** Identifies the form in anchor/container ids and the section query param. Defaults to `"form"`. */
  key?: string;
  /** Heading shown above the scrollable form. */
  title?: string;
  /** Whether the side navigation starts expanded. Defaults to `false`. */
  defaultOpen?: boolean;
  /**
   * Show field statuses and section summaries in the side navigation. Defaults to `true`.
   * Also shows progress for required editable fields. A provided value is not
   * necessarily valid until validation has run. A section with required fields
   * is complete when those fields are provided and there are no known errors;
   * unfilled recommended fields are reported separately.
   */
  showStatus?: boolean;
  /**
   * Whether this form currently owns the URL query params, e.g. when it is
   * the visible tab. Defaults to `true`.
   */
  active?: boolean;
  /** Whether to mirror the section/sub-section in the URL. Defaults to `true`. */
  syncUrl?: boolean;
  /** Query param used to store the active form section in the URL. Defaults to `"s"`. */
  sectionParam?: string;
  /** Query param used to store the active sub-section in the URL. Defaults to `"sub"`. */
  subSectionParam?: string;
}

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

export interface IFormButtons {
  buttons: PButton[];
  buttonStyle?: React.CSSProperties;
}

export interface IFormConfig {
  fields: TFormField[];
  sections?: IFormSection[];
  buttonConfig?: IFormButtons;
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

export interface IFieldMapping {
  sourceField: string;
  targetField: string;
  condition?: (value: any) => boolean;
  transform?: (value: any) => any;
  readOnlyWhenMapped?: boolean;
}

export interface IRemoteAutoCompleteData {
  [key: string]: object[];
}

export interface IUserProfileFormData {
  name?: string;
  email?: string;
  workplace?: string;
  [key: string]: any;
}

/** Config for a toggle form field component */
export interface IToggleFormField extends IFormComponent {
  /** The type of the form field, which is "toggle". */
  type: "toggle";
  /** The initial checked state of the toggle. */
  defaultChecked?: boolean;
}

/** Configures a nested object form, or a repeatable form for an array of objects. */
export interface ISubformField
  extends Omit<IFormComponent, "multiple" | "minOne"> {
  /** Identifies this field as a subform. */
  type: "subform";
  /** Fields that make up each nested object. */
  fields: TFormField[];
  /** When true, the field value is an array of objects; otherwise it is one object. */
  multiple?: boolean;
  /** Minimum number of objects required when multiple is true. */
  minItems?: number;
  /** Maximum number of objects allowed when multiple is true. */
  maxItems?: number;
  /** Singular label used for subform actions, such as "Add parent project". */
  itemLabel?: string;
  /** Relative field names used to display a summary for each object. */
  summaryFields?: string[];
  /**
   * Shows inline repeatable items as summary cards, expanding an item only
   * while it is being edited. Drawer subforms always use summary cards.
   */
  summary?: boolean;
  /** Controls whether the subform editor is shown inline or in a drawer. */
  editor?: {
    /** Explicit presentation, or choose automatically based on drawerThreshold. */
    presentation?: "inline" | "drawer" | "auto";
    /** In auto mode, use a drawer when the nested form exceeds this field count. */
    drawerThreshold?: number;
  };
}

/** Where rendered fields read and write their values, such as live form data or a drawer draft. */
export interface IFormValueSource {
  /** Data that field paths are resolved against. */
  data: Record<string, unknown>;
  /** Called with a field's full path and its new value. */
  onChange: (path: TFormFieldPath, value: unknown) => void;
}

/** State required to edit one repeatable subform item in a drawer. */
export interface ISubformDrawerState {
  /** Configuration for the subform being edited. */
  field: ISubformField;
  /** Path to the subform value in form data. */
  path: TFormFieldPath;
  /** Index of the item when editing a repeatable subform. */
  itemIndex?: number;
  /** Whether this item is being added rather than edited. */
  isNew: boolean;
  /** Original value used to detect unsaved changes for existing items. */
  initialValue?: unknown;
}

/** Props for the drawer used to add or edit a subform item. */
export interface PFormDrawer {
  /** Whether the drawer is visible. */
  open: boolean;
  /** Controls the drawer's open state. */
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  /** Drawer heading. */
  title: string;
  /** Whether the draft differs from its original value. */
  hasPendingChanges: boolean;
  /** Saves the current draft. */
  onSave: () => void;
  /** Discards the current draft. */
  onDiscard: () => void;
  /** Form fields rendered inside the drawer. */
  children: React.ReactNode;
}

/**
 * The base configuration for a user profile form,
 * including fields and button configuration.
 */
export type TProfileBaseConfig =
  /** the fields and button config for the base form */
  | IFormConfig
  /** Whether the form has unsaved changes */
  | ((hasUnsavedChanges: boolean, ...args: any[]) => IFormConfig);

  /** Context for determining the status of a form field. */
export interface IFieldStatusContext {
  /** Whether the entire form is locked. */
  formLocked: boolean;
  /** Whether the current section is locked. */
  sectionLocked?: boolean;
  /** Error message associated with the field, if any. */
  error?: string;
}
