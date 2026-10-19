/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ComponentType } from "react";
import { CELL_RENDERER_PARAMS } from "..";
import type { IFilter, TDataObjectOrNull } from "..";

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

interface IElementProps {
  [prop: string]: string | IFilter;
}

export interface ICellRenderer {
  type: TCellRendererType;
  props?: IElementProps;
  element?: any; // only added automatically
}

export type TCellRenderer =
  ICellRenderer
  | undefined;

export type TCustomDataPointRenderers = Record<string, ComponentType<any>>;

/** A data point for a field: a child object with its attribute value (which may be a list). */
export interface IDataPoint {
  /** The child object reached by the field path, or `null` if a relationship along the path is missing. */
  dataObject: TDataObjectOrNull;
  /** The child's attribute value. May be a list, which `DataPoint` renders as separate items. */
  value: any;
}

export type TCellRendererParamType = (typeof CELL_RENDERER_PARAMS)[keyof typeof CELL_RENDERER_PARAMS];

export interface IBoardCellRendererParam {
  type: TCellRendererParamType,
  rename: string,
  description: string,
  required?: boolean,
  previewExample?: string,
  placeholder?: string,
}

export type TBoardCellRendererParams = Record<string, IBoardCellRendererParam>;

export interface IBoardCellRenderer {
  params?: TBoardCellRendererParams
  allowedDataTypes?: string[]
  rename?: string
  description?: string
};

export interface IBoardCellRenderers {
  [rendererType: string]: IBoardCellRenderer
};
