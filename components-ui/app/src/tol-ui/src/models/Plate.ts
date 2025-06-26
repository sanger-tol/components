/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export type TPlateData = Array<TRow>;
type TRow = Array<IWellData>;

export interface IWellData {
  id: string;
  label: string;
  className?: string;
  percentage?: number;
  data?: any;
}

export interface IWellHoverContents {
  id: string;
  data: any;
}