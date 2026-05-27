/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { CELL_RENDERER_PARAMS } from "..";

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
