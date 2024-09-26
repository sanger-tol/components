/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

interface ElementProps {
  [prop: string]: string
}

interface CustomCellRenderer {
  element: any,
  propPointers?: ElementProps,
  props?: ElementProps
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
  custom?: boolean,
  filter?: string|null,
  fixed?: boolean,
  hidden?: boolean,
  isAttribute?: boolean,
  link?: string,
  rename?: string,
  sort?: boolean,
  type?: string,
  width?: number,
  description?: string
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

const fieldDefaults = () => {
  return {
    width: 200
  };
};

export function addFieldDefaults(field: Field) {
  return {
    ...fieldDefaults(),
    ...field
  };
}

export function initialiseFieldMeta(pageSize?: number, filterVisibility?: boolean) {
  if (filterVisibility === undefined) filterVisibility = true;
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