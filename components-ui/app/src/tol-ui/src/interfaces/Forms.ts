/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from "react";
import { TMessageType, PButton, TsDataSource } from "..";

export interface IWaitingUpload {
  message: string;
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

export interface ITextField {
  name: string;
  type: "text";
  label: string;
  accepter?: React.ReactNode; // Allows custom elements to be passed in
  helpText?: string;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  centred?: boolean;
}

// "email" and "password" are controlled by the same form element in
// the switch statement in `FormAllInOne`, so take the same options
export interface IEmailField extends Omit<ITextField, "type"> {
  type: "email"
}

export interface IPasswordField extends Omit<ITextField, "type"> {
  type: "password"
}

export interface ICountryselectField {
  name: string;
  type: "countryselect";
  label?: string;
}

export interface IDatetimeField {
  name: string,
  type: "datetime";
  label?: string;
  helpText?: string;
  placeholder?: string;
  hideMinutes?: (minute: number, date: Date) => boolean;
  format?: string;
}

export interface ISingleselectField {
  name: string;
  type: "singleselect";
  label: string;
  data: string[]; // Array of selectable options
  placeholder?: string;
  block?: boolean;
}

export interface ISingleselectcustomoptionField {
  name: string;
  type: "singleselectcustomvalue";
  data: string[];
  label?: string;
  customOptionPlaceholder?: string;
}

export interface IDropzoneField {
  name: string;
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

export interface IAutocompleteField {
  name: string;
  type: "autocomplete";
  label?: string;
  data: string;
}

export interface IMultipleselectField {
  name: string;
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

export interface IMarkdownField {
  name: string;
  type: "markdown";
  preview?: boolean;
  label?: string;
  removeCommands?: string[];
  height?: string | number;
  helpText?: string;
}

// This is named to avoid conflict with `ICheckboxField` from `ICheckboxConfig`,
// which you'll see used in this interface
export interface ICheckboxFormField {
  name: string;
  type: "checkbox";
  label: string;
  checkboxConfig: ICheckboxConfig;
  hidden?: boolean;
  inline?: boolean;
  indeterminate?: boolean;
  defaultChecked?: string[];
}

export type TFormField = 
  ITextField | IEmailField | IPasswordField |
  ICountryselectField | IDatetimeField |
  ISingleselectField | ISingleselectcustomoptionField |
  IDropzoneField | IAutocompleteField | IMultipleselectField |
  IMarkdownField | ICheckboxFormField;

export interface IFormButtons {
  buttons: PButton[];
  buttonStyle?: React.CSSProperties;
}

export interface IFormConfig {
  fields: TFormField[];
  buttonConfig?: IFormButtons;
}

export interface IRemoteAutoCompleteData {
  [key: string]: object[];
}
