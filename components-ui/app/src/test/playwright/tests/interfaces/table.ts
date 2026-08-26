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
   * The fields to select in the 'Active Columns' picker.
   * This includes provenance fields (in ATTRIBUTE[SOURCE] format)
   */
  activeColumns?: string[];
}
