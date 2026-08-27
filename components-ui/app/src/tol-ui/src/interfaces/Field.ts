/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { TCellRenderer } from "./Cells";

export interface IField {
  acts_as?: string;
  cellRenderer?: TCellRenderer;
  custom?: boolean;
  description?: string;
  filter?: string | null;
  fixed?: boolean;
  isAttribute?: boolean;
  object_type: string;
  rename?: string;
  sort?: boolean;
  source?: string;
  type?: string;
  width?: number;
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
