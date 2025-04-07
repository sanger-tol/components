/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { IButton } from "./";

export interface IInlineEdit {
  title: string;
  editable?: boolean;
  onSave?: (value: string) => void;
  onChange?: (value: string) => void;
}

export interface IUtilityBar {
  title?: IInlineEdit;
  buttons?: IButton[];
  elements?: JSX.Element[];
}

