/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ICellRenderer } from "..";

export interface IBoardParam {
  type: string,
  rename: string,
  required: boolean,
  description: string,
  previewExample?: string,
}

export type TBoardParams = Record<string, IBoardParam>;

export type INewCellRenderersToSave = {
  [attributeId: string]: ICellRenderer
};
