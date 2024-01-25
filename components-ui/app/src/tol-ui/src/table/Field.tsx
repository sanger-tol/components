/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { normaliseCaps } from "../general/Utils";


interface ElementPropPointers {
  [prop: string]: string
}

interface CustomCellRenderer {
  element: Function, // eslint-disable-line
  propPointers?: ElementPropPointers
}

export type CellRenderer = CustomCellRenderer|'relationship'|'relationshipDetail'|'datetime'|'boolean'|'image'

export interface Field {
  cellRenderer?: CellRenderer|null,
  filter?: boolean,
  filterType?: string|null,
  fixed?: boolean,
  hidden?: boolean,
  isAttribute?: boolean|null,
  link?: string|null,
  rename?: string|null,
  sort?: boolean,
  type?: string|null,
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
    cellRenderer: null,
    filter: true,
    filterType: null,
    fixed: false,
    hidden: false,
    isAttribute: null,
    link: null,
    rename: rename,
    sort: true,
    type: null,
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