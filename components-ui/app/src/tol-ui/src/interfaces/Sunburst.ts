/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { IFilter } from "./Filter"

/**
 * Interface for the data object representing a bucket in the sunburst chart
 */
export interface ISunburstBucketData {
  bucket: string,
  value: number,
  clickKey: string,
  datasetIndex: number,
  depth: number,
  filter: IFilter
}

/**
 * Type for the sunburst bucket data which can be either an ISunburstBucketData object or undefined
 */
export type TSunburstBucketDataOrUndefined = ISunburstBucketData | undefined
