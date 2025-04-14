/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export interface IInlineEdit {
  title: string;
  editable?: boolean;
  onSave?: (value: string) => void;
  onChange?: (value: string) => void;
}

