/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { TCellRenderer } from "./Cells";

export interface Field {
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
  acts_as?: string;
  custom?: boolean;
}

export interface FieldMetaData {
  [key: string]: Field;
}

export interface FieldMetaOrder {
  active: string[];
  inactive?: string[];
}
export interface FieldMeta {
  data?: FieldMetaData; // original fields with specified options
  dataWithDefaults?: FieldMetaData; // fields with defaults added
  order: FieldMetaOrder;
}
