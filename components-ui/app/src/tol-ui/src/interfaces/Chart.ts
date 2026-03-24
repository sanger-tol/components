/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { IFilter } from "./Filter"

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

export interface ISunburstBucketData {
  bucket: string,
  value: number,
  clickKey: string,
  datasetIndex: number,
  depth: number,
  filter: IFilter
}

export type TSunburstBucketDataOrUndefined = ISunburstBucketData | undefined