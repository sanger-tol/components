// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import type { TAttributeAndProvenanceList } from "..";

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
   * Specifies the attributes to pick, and which provenances to pick for those attributes
   * (if applicable). A provenances value of `null` means none, and including "calc" in the
   * list means to choose the original field as well. See documentation for this type.
   */
  fields?: TAttributeAndProvenanceList;
}
