/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

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
  isAttribute?: boolean|null,
  link?: string|null,
  relationshipBox?: boolean,
  rename?: string|null,
  sort?: boolean,
  type?: string|null,
  width?: number
}

export interface Fields {
  [key: string]: Field
}

const fieldDefaults: Field = {
  cellRenderer: null,
  filter: true,
  filterType: null,
  isAttribute: null,
  link: null,
  relationshipBox: false,
  rename: null,
  sort: true,
  type: null,
  width: 200
}

export function addFieldDefaults(field: Field) {
  return {
    ...fieldDefaults,
    ...field
  }
}
