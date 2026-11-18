/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type React from "react";
import type { TagInputProps } from "rsuite";
import type {
  PButton,
  PIcon,
  TCheckboxFields,
  TFormField,
  TFormLabelIconPosition,
  TLabelAndValueData,
  TMessageType,
  TTextEditorButtons,
  TsDataSource,
  IEditorOptions
} from "../..";

/** Message shown while a dropzone waits for an upload to complete. */
export interface IWaitingUpload {
  /** The message to display while waiting for the upload to complete. */
  message: string | React.ReactNode;
}

/** Message and presentation type displayed by a form. */
export interface IMessage {
  /** The type of message. Can be "success", "info", "warning", or "error". */
  type: string;
  /** The message to display. Can be a string or a React node. */
  message: TMessageType;
}

/** File metadata tracked by a form dropzone. */
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

/** A selectable option for a multiple-select field. */
export interface IMultiSelectData {
  /** The label for the multiple select option. */
  label: string;
  /** The value for the multiple select option. */
  value: string;
}

/** Props for an individual checkbox option. */
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

/** Checkbox options configured for a checkbox form field. */
export interface ICheckboxConfig {
  /** The fields configuration for the checkbox form field. */
  fields: TCheckboxFields;
}

/** Icon configuration displayed alongside a form field label. */
export interface IFormLabelIcon extends PIcon {
  /** The position of the form label icon. */
  position?: TFormLabelIconPosition;
}

/** Shared configuration for form fields and their controls. */
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
  /** Whether the form field is required. If true, the user must provide a value for the field before submitting the form. This will also display a red asterisk next to the label. */
  required?: boolean;
  /** Hides this field when the predicate returns true for its containing object. */
  hiddenWhen?: (formData: Record<string, any>) => boolean;
  /** Whether the form field is centered. If true, the label and input element will be centered. */
  centered?: boolean;
  /** The icon for the form field label. This is displayed next to the label. */
  icon?: IFormLabelIcon;
  /** Whether the form field label is displayed inline with the input element. If true, the label will be displayed to the left of the input element. */
  labelInline?: boolean;
  /** Section identifier used to group this field in the form. */
  section?: string;
  /** Enables repeated rows for this field. Subforms use this to hold an array of nested objects instead. */
  multiple?: boolean;
  /** Called when a repeated row is removed; `remove` performs the actual removal. */
  onMinus?: (inputId: string, value: any, remove: () => void) => void;
  /** Requires at least one row when this field is repeated. */
  minOne?: boolean;
  /** Creates an additional action button for each repeated row. */
  rowButton?: (inputId: string, value: any) => PButton;
  /** Whether the required field should display the required text instead of the asterisk. */
  requiredAsText?: boolean;
}

/** Configuration for a single-line text input. */
export interface ITextField extends IFormComponent {
  /** The type of the text field. */
  type: "text";
  /** Custom RSuite accepter component rendered for the text input. */
  accepter?: React.ReactNode;
}

/** Configuration for an email input. */
export interface IEmailField extends Omit<ITextField, "type"> {
  /** Identifies this field as an email input. */
  type: "email";
}

/** Configuration for a password input. */
export interface IPasswordField extends Omit<ITextField, "type"> {
  /** Identifies this field as a password input. */
  type: "password";
}

/** Configuration for a country picker. */
export interface ICountryselectField extends IFormComponent {
  /** Identifies this field as a country picker. */
  type: "countryselect";
}

/** Configuration for a date and time input. */
export interface IDatetimeField extends IFormComponent {
  /** Identifies this field as a date and time input. */
  type: "datetime";
  /** Returns whether a minute should be disabled for the given date. */
  hideMinutes?: (minute: number, date: Date) => boolean;
  /** Display and parsing format for the date and time value. */
  format?: string;
}

/** A label/value pair used to populate select options. */
export interface ILabelAndValueDataInstance {
  /** Text displayed for this option. */
  label: string;
  /** Value stored when this option is selected. */
  value: any;
  /** Additional option data preserved by consumers. */
  [otherParams: string]: any;
}

/** Configuration for a single-select field. */
export interface ISingleselectField extends IFormComponent {
  /** Identifies this field as a single-select. */
  type: "singleselect";
  /** Options available for selection. */
  data: string[] | TLabelAndValueData;
  /** Whether the select should fill its available width. */
  block?: boolean;
  /** Disables the select control. */
  disabled?: boolean;
}

/** Configuration for a single-select field that supports a custom option. */
export interface ISingleselectcustomoptionField extends IFormComponent {
  /** Identifies this field as a custom-option single-select. */
  type: "singleselectcustomoption";
  /** Options available for selection. */
  data: string[];
  /** Placeholder shown when entering a custom option. */
  customOptionPlaceholder?: string;
}

/** Configuration for a tag-entry field. */
export interface IFormTagField extends Omit<
  IFormComponent,
  "children" | "value"
> {
  /** Identifies this field as a tag input. */
  type: "tag";
  /** Props passed to the underlying RSuite tag input. */
  inputProps?: TagInputProps;
  /** Initial or controlled tags for the field. */
  value?: string[];
  /** Validation message shown with the tag input. */
  errorText?: string;
}

/** Configuration for a file dropzone field. */
export interface IDropzoneField extends IFormComponent {
  /** Identifies this field as a dropzone. */
  type: "dropzone";
  /** Resource identifier used by the upload data source. */
  resource: string;
  /** Data source used to upload and retrieve files. */
  dataSource: TsDataSource;
  /** Accepted file type or MIME type. */
  fileType: string;
  /** Creates user-facing messages from the upload response. */
  generateMessages?: (apiRes: any) => IMessage[];
  /** Applies or transforms the upload response. */
  setResponse?: any;
  /** Called after files are dropped. */
  onFileDrop?: (length: boolean) => void;
  /** Whether to display the uploaded file list. */
  fileListVisible?: boolean;
  /** Files currently shown by the dropzone. */
  fileList?: IFileData[];
  /** Updates the displayed file list. */
  setFileList?: (fileList: IFileData[]) => void;
  /** Whether the parent form should be submitted with the uploaded file. */
  parentToSubmit?: boolean;
  /** Changing this value resets the dropzone. */
  resetKey?: string | number;
  /** Whether file validation is in progress. */
  validating?: boolean;
}

/** Configuration for an autocomplete field. */
export interface IAutocompleteField extends IFormComponent {
  /** Identifies this field as an autocomplete. */
  type: "autocomplete";
  /** Label displayed for the autocomplete. */
  label: string;
  /** Local options; remote autocomplete fields may load options from `dataSource`. */
  data: string[];
  /** Data source used to retrieve remote autocomplete options. */
  dataSource?: TsDataSource;
}

/** Remote autocomplete results keyed by the response field name. */
export interface IRemoteAutoCompleteData {
  /** Result objects indexed by the corresponding response field. */
  [key: string]: object[];
}

/** Configuration for a multiple-select field. */
export interface IMultipleselectField extends IFormComponent {
  /** Identifies this field as a multiple-select. */
  type: "multipleselect";
  /** Keeps the select control fixed while its containing area scrolls. */
  sticky?: boolean;
  /** Whether the select should fill its available width. */
  block?: boolean;
  /** Placeholder shown when no option is selected. */
  placeholder?: string;
  /** Options available for selection. */
  data: string[] | IMultiSelectData[];
  /** Disables the select control. */
  disabled?: boolean;
  /** Disables the select when the predicate returns true for current form data. */
  disabledWhen?: (formData: Record<string, any>) => boolean;
  /** Shows a loading state while options are being retrieved. */
  loading?: boolean;
  /** Controls whether the option menu is open. */
  open?: boolean;
  /** Called when the option menu opens. */
  onOpen?: any;
  /** Called immediately before the option menu opens. */
  onEntering?: any;
  /** Called when the option menu closes. */
  onClose?: any;
  /** Called when the selected values are cleared. */
  onClean?: any;
  /** Called when the select control is clicked. */
  onClick?: any;
  /** Renders an option in the menu. */
  renderMenuItem?: any;
  /** Renders the selected value or values. */
  renderValue?: any;
  /** Hides the option search input. */
  noSearch?: boolean;
  /** Hides the select-all option. */
  noSelectAll?: boolean;
  /** Accessible label displayed for the multiple-select field. */
  label?: string;
  /** Option values the user cannot select. */
  disabledItemValues?: string[];
  /** Determines whether an option is included in search results. */
  searchBy?: (keyword: string, label: any, item: any) => boolean;
  /** Custom caret component for the select control. */
  caretAs?: any;
  /** Renders additional content below the option menu. */
  renderExtraFooter?: any;
  /** Additional CSS class applied to the select control. */
  className?: string;
  /** Called when the option menu begins its exit transition. */
  onExit?: any;
  /** Called while the option menu is exiting. */
  onExiting?: any;
  /** Groups options by the named property. */
  groupBy?: string;
}

/** Configuration for a markdown field. */
export interface IMarkdownField extends IFormComponent {
  /** Identifies this field as a markdown editor. */
  type: "markdown";
  /** Whether to show the rendered markdown preview. */
  preview?: boolean;
  /** Editor commands to omit. */
  removeCommands?: string[];
  /** Height of the editor. */
  height?: string | number;
}

/** Configuration for a rich-text textarea field. */
export interface ITextAreaField extends IFormComponent {
  /** Identifies this field as a rich-text textarea. */
  type: "textarea";
  /** Options used to configure the editor. */
  options?: IEditorOptions;
  /** Toolbar buttons displayed in the editor. */
  menuButtons?: TTextEditorButtons;
  /** Validation message shown with the editor. */
  errorText?: string;
  /** Format used to return the editor content. */
  returnValueType?: "html" | "json" | "text";
  /** Additional editor extensions. */
  customExtensions?: any[];
  /** Additional toolbar buttons. */
  customButtons?: any[];
  /** Element used to explain keyboard shortcuts. */
  keyboardShortcutElement?: React.ReactNode;
  /** Whether the editor accepts changes. */
  editable?: boolean;
  /** Height of the editor. */
  height?: string | number;
  /** Called with the editor instance after it changes. */
  onEditorChange?: (editor: any) => void;
}

/** Configuration for a checkbox group form field. */
export interface ICheckboxFormField extends IFormComponent {
  /** Identifies this field as a checkbox group. */
  type: "checkbox";
  /** Label displayed for the checkbox group. */
  label: string;
  /** Options displayed in the group. */
  checkboxConfig: ICheckboxConfig;
  /** Hides the checkbox group. */
  hidden?: boolean;
  /** Displays the options on one line. */
  inline?: boolean;
  /** Whether the group is in an indeterminate state. */
  indeterminate?: boolean;
  /** Option values checked when no initial form value is supplied. */
  defaultChecked?: string[];
}

/** Config for a toggle form field component */
export interface IToggleFormField extends IFormComponent {
  /** The type of the form field, which is "toggle". */
  type: "toggle";
  /** The initial checked state of the toggle. */
  defaultChecked?: boolean;
}
