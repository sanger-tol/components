/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { ICustom } from "../..";

/** Datasource capability for handling custom requests. */
export interface CustomOperator {
  custom(args: ICustom): Promise<any>;
}