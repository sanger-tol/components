/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { TsDataSource, IDataObject } from "..";


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
  | "custom";

export interface ICellRenderer {
  type: CellRendererType;
  element?: any;
  props?: ElementProps;
  propPointers?: ElementProps;
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

export type ITableRecord = Record<string, any>;

export type ITableData = ITableRecord[];

export interface ICellRendererInstanceData {
  key: string,
  value?: string,
  dataObject: IDataObject,
  dataSource?: TsDataSource;
}
