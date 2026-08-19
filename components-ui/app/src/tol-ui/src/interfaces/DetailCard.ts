/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { ReactNode } from "react";

export interface IDetailCardField {
  /** Stable field identifier used when rendering dynamic field lists. */
  id?: string;
  /** Label describing the field value. */
  label: ReactNode;
  /** Field value. Nullish values are not rendered. */
  value?: ReactNode;
}
