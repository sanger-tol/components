/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { ICounter, TCountOrNull } from "../..";

/** Datasource capability for handling custom requests. */
export interface Counter {
  getCount(args: ICounter): Promise<TCountOrNull>;
}