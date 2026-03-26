/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { IFilter } from "./Filter"

/**
 * Interface for the data object representing a section in the sunburst
 */
export interface ISunburstSectionClickedData {
  /**
   * The name of the bucket e.g. `sts_order_group`
   */
  bucket: string,
  /**
   * The total count for this bucket
   */
  value: number,
  /**
   * The key that has been clicked e.g. `Diptera`
   */
  clickKey: string,
  /**
   * The dataset index for the datasets used in ChartJS.
   * The outer most ring of the sunburst has index 0,
   * and the index increases by 1 for each inner ring.
   */
  datasetIndex: number,
  /**
   * The depth of the section in the sunburst chart,
   * starting from the inner most ring. Starts at 1.
   */
  depth: number,
  /**
   * A compunded filter, taking account of its parents
   */
  filter: IFilter
}

/**
 * Type for the sunburst bucket data which can be either an ISunburstSectionClickedData object or undefined
 */
export type TSunburstBucketDataOrUndefined = ISunburstSectionClickedData | undefined
