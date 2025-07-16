/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { TMessageType, IButton } from "..";

export interface IWaitingUpload {
  message: string;
}

export interface IMessage {
  type: string;
  message: TMessageType;
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

export type TCheckboxFields = ICheckboxField[];

export interface IFormConfig {
  fields: object[];
  buttonConfig?: IFormButtons;
}

export interface IFormButtons {
  buttons: IButton[];
  buttonStyle?: React.CSSProperties;
}