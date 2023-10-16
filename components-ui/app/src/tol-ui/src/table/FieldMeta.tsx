/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { normaliseCaps } from "../general/Utils"


interface ElementPropPointers {
  [prop: string]: string
}

export interface CellRenderer {
  element: Function,
  propPointers: ElementPropPointers
}

interface Field {
  cellRenderer?: CellRenderer|null,
  filter?: boolean,
  filterType?: string|null,
  hidden?: boolean,
  isAttribute?: boolean|null,
  link?: string|null,
  relationshipBox?: boolean,
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

const fieldDefaults = (key: string) => {
  return {
    cellRenderer: null,
    filter: true,
    filterType: null,
    hidden: false,
    isAttribute: null,
    link: null,
    relationshipBox: false,
    rename: normaliseCaps(key),
    sort: true,
    type: null,
    width: 200
  }
}

export function addFieldDefaults(key: string, field: Field) {
  return {
    ...fieldDefaults(key),
    ...field
  }
}

export function initialiseFieldMeta(filterVisibility?: boolean, pageSize?: number) {
  if (filterVisibility === undefined) filterVisibility = false
  if (pageSize === undefined) pageSize = 50

  return {
    data: {},
    order: {
      active: [],
      inactive: []
    },
    filterVisibility: filterVisibility,
    pageSize: pageSize
  } as FieldMeta
}