/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { IFieldMeta } from "..";

/** Save payload for list-style component configuration. */
export interface IListDataConfigSave {
  /** Field selection metadata for the list. */
  fieldMeta?: IFieldMeta;
  /** Default attribute used for sorting the list. */
  defaultSortByAttribute?: string;
  /** Default sort direction for the list. */
  defaultSortByType?: string;
}
