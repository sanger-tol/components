/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { normaliseCaps } from "../general/Utils";


interface ElementPropPointers {
  [prop: string]: string
}

interface CustomCellRenderer {
  element: any,
  propPointers?: ElementPropPointers
}

export type CellRenderer = (
  CustomCellRenderer|
  'relationship'|
  'relationshipDetail'|
  'datetime'|
  'boolean'|
  'image'|
  'list'|
  'expander'|
  'float'|
  null
)

export interface Field {
  cellRenderer?: CellRenderer,
  filter?: boolean,
  filterType?: string,
  fixed?: boolean,
  hidden?: boolean,
  isAttribute?: boolean,
  link?: string,
  rename?: string,
  sort?: boolean,
  type?: string,
  width?: number
}

export interface FieldMetaData {
  [key: string]: Field
}

export interface FieldMetaOrder {
  active: string[],
  inactive: string[]
}

export interface FieldMeta {
  data: FieldMetaData,
  order: FieldMetaOrder
  filterVisibility: boolean,
  pageSize: number
}

const fieldDefaults = (key: string, endpoint?: string) => {
  const rename = normaliseCaps(key, endpoint);

  return {
    cellRenderer: undefined,
    filter: true,
    filterType: undefined,
    fixed: false,
    hidden: false,
    isAttribute: undefined,
    link: undefined,
    rename: rename,
    sort: true,
    type: undefined,
    width: 200
  };
};

export function addFieldDefaults(field: Field, key: string, endpoint?: string) {
  return {
    ...fieldDefaults(key, endpoint),
    ...field
  };
}

export function initialiseFieldMeta(filterVisibility?: boolean, pageSize?: number) {
  if (filterVisibility === undefined) filterVisibility = false;
  if (pageSize === undefined) pageSize = 50;

  return {
    data: {},
    order: {
      active: [],
      inactive: []
    },
    filterVisibility: filterVisibility,
    pageSize: pageSize
  } as FieldMeta;
}