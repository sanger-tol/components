/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { FieldMeta } from "../table/Field";

export interface IColumnConfigDrawer {
  baseUrl?: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  fieldMeta: FieldMeta;
  displaySource?: boolean;
  onConfigSave: (fieldMeta: FieldMeta) => void;
  endpoint: string;
  sticky?: boolean;
}

export interface IFilterDrawer {
  open: boolean;
  setOpen: () => void;
}
