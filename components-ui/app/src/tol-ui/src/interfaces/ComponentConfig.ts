/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { IFieldMeta, ISortBy } from "..";

/** Save payload for list-style component configuration. */
export interface IListDataConfigSave extends ISortBy {
  /** Field selection metadata for the list. */
  fieldMeta?: IFieldMeta;
  /** Default number of records displayed per page. */
  pageSize?: number;
}
