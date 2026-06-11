/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { CELL_RENDERER_PARAMS } from "..";
import type { IFilter } from "..";

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

interface ElementProps {
  [prop: string]: string | IFilter;
}

export interface ICellRenderer {
  type: TCellRendererType;
  props?: ElementProps;
  element?: any; // only added automatically
}

export type TCellRenderer =
  ICellRenderer
  | undefined;

export interface ICustomCellRenderers {
  [customType: string]: any;
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
