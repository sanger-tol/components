/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { ReactNode } from "react";

export interface IKeyValueTableRow {
  /** Stable field identifier. This does not need to be a database ID. */
  id: string;
  /** Human-readable field name. */
  label: ReactNode;
  /** Value associated with the field. */
  value?: ReactNode;
  /** Optional links or controls associated with the field. */
  actions?: ReactNode;
}
