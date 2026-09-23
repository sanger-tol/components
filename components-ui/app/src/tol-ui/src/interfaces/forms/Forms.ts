/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from "react";
import type {
  TMessageType,
  PButton,
  TsDataSource,
  PIcon,
  TTextEditorButtons,
  TFormLabelIconPosition,
  TCheckboxFields,
  TFormField,
  TLabelAndValueData,
} from "../..";

export interface IWaitingUpload {
  /**
   * The message to display while waiting for the upload to complete.
   */
  message: string | React.ReactNode;
}

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

export interface IFileData {
  blobFile: File;
  fileKey: string;
  name: string;
  status: string;
}

export interface IData {
  label: string;
  value: string;
}

export interface ICheckboxField {
  disabled?: boolean;
  defaultChecked?: boolean;
  value: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  subtext?: string;
}

export interface ICheckboxConfig {
  fields: TCheckboxFields;
}

export interface IFormLabelIcon extends PIcon {
  position?: TFormLabelIconPosition;
}

export interface IFormComponent {
  /**
   * The unique identifier for the form field.
   */
  id?: string;
  /**
   * The name of the form field. This is used to identify the field in the form data.
   */
  name: string;
  /**
   * The type of form field. This determines the kind of input element that will be rendered.
   */
  type: TFormField["type"];
  /**
   * The label for the form field. This is displayed above the input element.
   */
  label?: string;
  /**
   * The help text for the form field. This is displayed below the input element.
   */
  helpText?: string;
  /**
   * The placeholder text for the form field. This is displayed inside the input element when it is empty.
   */
  placeholder?: string;
  /**
   * Whether the form field is read-only. If true, the user cannot modify the value of the field.
   */
  readOnly?: boolean;
  /**
   * Whether the form field is required. If true, the user must provide a value for the field before submitting the form.
   * This will also display a red asterisk next to the label.
   */
  required?: boolean;
  /**
   * Whether the form field is centered. If true, the label and input element will be centered.
   */
  centered?: boolean;
  /**
   * The icon for the form field label. This is displayed next to the label.
   */
  icon?: IFormLabelIcon;
  /**
   * Whether the form field label is displayed inline with the input element.
   * If true, the label will be displayed to the left of the input element.
   */
  labelInline?: boolean;
  /**
   * The section of the form that this field belongs to. This can be used to group related fields together.
   */
  section?: string;
  /**
   * Whether multiple of a particular form field should be allowed. If true, the user can add multiple instances of this field.
   */
  multiple?: boolean;
  /**
   * Whether at least one instance of a particular form field is required.
   * If true, the user must provide at least one instance of this field before submitting the form.
   */
  minOne?: boolean;
}

export interface ITextField extends IFormComponent {
  type: "text";
  accepter?: React.ReactNode; // Allows custom elements to be passed in
}

// "email" and "password" are controlled by the same form element in
// the switch statement in `FormAllInOne`, so take the same options
export interface IEmailField extends Omit<ITextField, "type"> {
  type: "email";
}

export interface IPasswordField extends Omit<ITextField, "type"> {
  type: "password";
}

export interface ICountryselectField extends IFormComponent {
  type: "countryselect";
}

export interface IDatetimeField extends IFormComponent {
  type: "datetime";
  hideMinutes?: (minute: number, date: Date) => boolean;
  format?: string;
}

export interface ILabelAndValueDataInstance {
  label: string;
  value: any;
  [otherParams: string]: any;
}
export interface ISingleselectField extends IFormComponent {
  type: "singleselect";
  data: string[] | TLabelAndValueData; // Array of selectable options
  block?: boolean;
}

export interface ISingleselectcustomoptionField extends IFormComponent {
  type: "singleselectcustomoption";
  data: string[];
  customOptionPlaceholder?: string;
}

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

export interface IAutocompleteField extends IFormComponent {
  type: "autocomplete";
  label: string;
  data: string[];
  dataSource?: TsDataSource; // Exists if this is a RemoteAutoComplete field
}

export interface IMultipleselectField extends IFormComponent {
  /* Whether the multiple select field should stick to the top when scrolling. */
  type: "multipleselect";
  /* Whether the multiple select field should be displayed as a block element. */
  sticky?: boolean;
  /* The data for the multiple select field, either an array of strings or an array of IData objects. */
  block?: boolean;
  /* The data to use for the multiple select field. */
  data: string[] | IData[];
  /* Placeholder text for the multiple select field. */
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

export interface IFormButtons {
  buttons: PButton[];
  buttonStyle?: React.CSSProperties;
}

export interface IFormConfig {
  fields: TFormField[];
  buttonConfig?: IFormButtons;
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

/**
 * The base configuration for a user profile form,
 * including fields and button configuration.
 */
export type TProfileBaseConfig =
  /** the fields and button config for the base form */
  | IFormConfig
  /** Whether the form has unsaved changes */
  | ((hasUnsavedChanges: boolean, ...args: any[]) => IFormConfig);
