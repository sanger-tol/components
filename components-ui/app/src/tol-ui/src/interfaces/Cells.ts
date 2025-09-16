/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export interface IBoardParam {
  type: string,
  rename: string,
  required: boolean
}

export type TBoardParams = Record<string, IBoardParam>;