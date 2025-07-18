/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

interface ElementProps {
  [prop: string]: string;
}

interface CustomCellRenderer {
  element: any;
  propPointers?: ElementProps;
  props?: ElementProps;
}

export type CellRenderer =
  | CustomCellRenderer
  | "relationship"
  | "relationshipDetail"
  | "datetime"
  | "boolean"
  | "image"
  | "list"
  | "expander"
  | "float"
  | "integer"
  | null
  | undefined;

export interface Field {
  cellRenderer?: CellRenderer;
  custom?: boolean;
  filter?: string | null;
  fixed?: boolean;
  isAttribute?: boolean;
  link?: string;
  rename?: string;
  sort?: boolean;
  type?: string;
  width?: number;
  description?: string;
  source?: string;
}

export interface FieldMetaData {
  [key: string]: Field;
}

export interface FieldMetaOrder {
  active: string[];
  inactive?: string[];
}

export interface FieldMeta {
  data?: FieldMetaData;
  order: FieldMetaOrder;
}
