/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { TCellRenderer } from "./Cells";

/** Core metadata shared by all fields. */
export interface IFieldBasic {
  /** Custom renderer used to display this field's cells. */
  cellRenderer?: TCellRenderer;
  /** Display name override for the field. */
  rename?: string;
  /** The field's data type, in python, for example "str" or "int". */
  type?: string;
  /** Optional description shown alongside the field, e.g. in tooltips. */
  description?: string;
  /** Underlying relationship path or origin the field's value is sourced from. */
  source?: string;
  /** Overrides how the field's value is treated. */
  actsAs?: string;
  /** Whether this is a custom ui field. */
  custom?: boolean;
}

/** Field metadata specific to table columns. */
export interface IFieldTable extends IFieldBasic {
  /** Filter input type, or `null` to disable filtering. */
  filter?: string | null;
  /** Whether the column is fixed (pinned) in place while scrolling. */
  fixed?: boolean;
  /** Whether the column can be sorted. */
  sort?: boolean;
  /** Column width in pixels. */
  width?: number;
}

/** A field's metadata. */
export type TField = IFieldBasic | IFieldTable;

/** Mapping of field identifiers to their metadata. */
export type TFieldMetaData = Record<string, TField>;

/** Display order and visibility for a set of fields. */
export interface IFieldOrder {
  /** Ordered list of visible field identifiers. */
  active: string[];
  /** Ordered list of hidden field identifiers. */
  inactive?: string[];
  /** Whether the set of visible fields is capped/restricted. */
  limitVisibility?: boolean;
}

/** Metadata describing a component's fields and their display order. */
export interface IFieldMeta {
  /** Original fields with specified options. */
  data?: TFieldMetaData;
  /** Fields with defaults added from attributeMetadata */
  dataWithDefaults?: TFieldMetaData;
  /** Display order and visibility of the fields. */
  order: IFieldOrder;
}
