/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export interface IBoardParam {
  type: string,
  required: boolean
}

export type TBoardParams = Record<string, IBoardParam>;