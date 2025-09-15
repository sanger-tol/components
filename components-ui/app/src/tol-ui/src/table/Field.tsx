/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/


export interface ICustomCellRenderers {
  [customType: string]: any;
}

interface ElementProps {
  [prop: string]: string;
}

export type CellRendererType =
  "relationship"
  | "relationshipDetail"
  | "datetime"
  | "boolean"
  | "image"
  | "list"
  | "expander"
  | "float"
  | "integer"
  | "link"
  | string;

export interface ICellRenderer {
  type: CellRendererType;
  element?: any;
  props?: ElementProps;
}

export type TCellRenderer =
  ICellRenderer
  | null // turn off cell renderer if a default is usually added
  | undefined;


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

export type ITableRecord = Record<string, any>;

export type ITableData = ITableRecord[];

