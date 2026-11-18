/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { resolveScrollNavConfig } from "../..";

/** The navigation status of a form field. */
export type TFieldNavStatus =
  | "auto"
  | "locked"
  | "error"
  | "required"
  | "complete"
  | "recommended"
  | "none";

export type TResolvedFormScrollNavConfig = NonNullable<
  ReturnType<typeof resolveScrollNavConfig>
>;
