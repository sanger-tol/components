/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { IGetOne } from "../..";

/** Datasource capability for handling delete requests. */
export interface Deleter {
  deleteByID(args: IGetOne): Promise<void>;
}