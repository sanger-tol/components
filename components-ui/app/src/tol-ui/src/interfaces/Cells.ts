/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ICellRenderer } from "..";

export interface IBoardCellRendererParam {
  type: string,
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
};

export interface IBoardCellRenderers {
  [rendererType: string]: IBoardCellRenderer
};
