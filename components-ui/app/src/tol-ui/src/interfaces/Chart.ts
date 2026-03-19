/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export interface IChartDataset {
  backgroundColor: string[],
  borderColor: string[],
  colourIndex: number,
  data: number[],
  hoverBackgroundColor: string[],
  id: string,
  label: string,
  order: number,
  pointHoverRadius: number[],
  pointRadius: number[]
}