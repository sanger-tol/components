/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from "react";
import {
  TMessageType,
  PButton,
  TsDataSource,
  PIcon,
  TTextEditorButtons,
} from "../..";

export interface IWaitingUpload {
  message: string | React.ReactNode;
}

export interface IMessage {
  type: string;
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

export type TCheckboxFields = ICheckboxField[];

// Below until the IFormConfig interface allows for type hints when
// designing a form config object

export interface IFormLabelIcon extends PIcon {
  position?: "left" | "right";
}

export interface IFormComponent {
  id?: string;
  name: string;
  type: TFormField["type"];
  label?: string;
  helpText?: string;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  centered?: boolean;
  icon?: IFormLabelIcon;
  labelInline?: boolean;
  section?: string;
  multiple?: boolean;
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

export type TLabelAndValueData = ILabelAndValueDataInstance[];

export interface ISingleselectField extends IFormComponent{
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
  type: "multipleselect";
  sticky?: boolean;
  block?: boolean;
  data: string[] | IData[];
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  open?: boolean;
  onOpen?: any;
  onEntering?: any;
  onClose?: any;
  onClean?: any;
  onClick?: any;
  renderMenuItem?: any;
  renderValue?: any;
  noSearch?: boolean;
  noSelectAll?: boolean;
  label?: string;
  disabledItemValues?: string[];
  searchBy?: (keyword: string, label: any, item: any) => boolean;
  caretAs?: any;
  renderExtraFooter?: any;
  className?: string;
  onExit?: any;
  onExiting?: any;
  groupBy?: string;
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

// This is named to avoid conflict with `ICheckboxField` from `ICheckboxConfig`,
// which you'll see used in this interface
export interface ICheckboxFormField extends IFormComponent {
  type: "checkbox";
  label: string;
  checkboxConfig: ICheckboxConfig;
  hidden?: boolean;
  inline?: boolean;
  indeterminate?: boolean;
  defaultChecked?: string[];
}

export type TFormField =
  | ITextField
  | IEmailField
  | IPasswordField
  | ICountryselectField
  | IDatetimeField
  | ISingleselectField
  | ISingleselectcustomoptionField
  | IDropzoneField
  | IAutocompleteField
  | IMultipleselectField
  | IMarkdownField
  | ITextAreaField
  | ICheckboxFormField;

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

export type TAutoCompleteValue = string | { value: string; id?: string };

export interface IUserProfileFormData {
  name?: string;
  email?: string;
  workplace?: string;
  [key: string]: any;
}

export type TUserProfileFormDataOrNull = IUserProfileFormData | null;
