/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { IDefaultSort, IFieldMeta } from "..";

/** Save payload for list-style component configuration. */
export interface IListDataConfigSave extends IDefaultSort {
  /** Field selection metadata for the list. */
  fieldMeta?: IFieldMeta;
  /** Default number of records displayed per page. */
  pageSize?: number;
}
