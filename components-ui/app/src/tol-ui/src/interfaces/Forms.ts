/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from "react";
import { TMessageType, PButton } from "..";

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

export interface IFormConfig {
  fields: object[];
  buttonConfig?: IFormButtons;
}

export interface IFormButtons {
  buttons: PButton[];
  buttonStyle?: React.CSSProperties;
}