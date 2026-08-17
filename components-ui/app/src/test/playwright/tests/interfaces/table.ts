// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

export interface IConfigureTable {
  /**
   * The field to choose in the 'Default Sort' select
   */
  defaultSort?: string;
  /**
   * Whether to enable the 'Limit Column Visibility' slider
   */
  limitColumnVisibility?: boolean;
  /**
   * The columns to choose in the 'Active Columns' dropdown.
   * Columns are added in the order provided in this array.
   */
  activeColumns?: string[];
  /**
   * Specifies the provenance option selected for fields in `activeColumns`.
   * If a field in `activeColumns` is a key in this record, it selects the sources in the given
   * array. "calc" is used as the collated provenance source, while the rest are usual sources like
   * "sts".
   */
  provenances?: Record<string, string[]>;
}
