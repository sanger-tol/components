/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { IFilter } from "..";

export interface ICustomCellRenderers {
  [customType: string]: any;
}

interface ElementProps {
  [prop: string]: string | IFilter;
}

export type TCellRendererType =
  "boolean" |
  "datetime" |
  "expander" |
  "float" |
  "image" |
  "integer" |
  "link" |
  "list" |
  "none" |
  "relationship" |
  string;

export interface ICellRenderer {
  type: TCellRendererType;
  props?: ElementProps;
  element?: any; // only added automatically
}

export type TCellRenderer =
  ICellRenderer
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

export type ITableRecord = Record<string, any>;

export type ITableData = ITableRecord[];

