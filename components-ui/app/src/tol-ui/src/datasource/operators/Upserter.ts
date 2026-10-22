/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { IUpsert, TDataObjectListOrNull } from "../..";

/** Datasource capability for creating or updating data objects. */
export interface Upserter {
  /** Creates or updates data objects using the provided upsert request. */
  upsert(args: IUpsert): Promise<TDataObjectListOrNull>;
}