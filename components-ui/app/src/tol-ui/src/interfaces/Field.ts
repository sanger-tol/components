/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { TCellRenderer } from "./Cells";

export interface IField {
  cellRenderer?: TCellRenderer;
  filter?: string | null;
  fixed?: boolean;
  isAttribute?: boolean;
  rename?: string;
  sort?: boolean;
  type?: string;
  width?: number;
  description?: string;
  source?: string;
  actsAs?: string;
  custom?: boolean;
}

export interface IFieldMetaData {
  [key: string]: IField;
}

export interface IFieldMetaOrder {
  active: string[];
  inactive?: string[];
  limitVisibility?: boolean;
}
export interface IFieldMeta {
  data?: IFieldMetaData; // original fields with specified options
  dataWithDefaults?: IFieldMetaData; // fields with defaults added
  order: IFieldMetaOrder;
}
