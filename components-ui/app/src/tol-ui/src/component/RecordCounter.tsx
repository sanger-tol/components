/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { formatTotalSize } from "..";

/** Props for the `RecordCounter` component. */
export interface PRecordCounter {
  /** Total number of records available. */
  totalSize: number;
  /** Optional loading state. When true, the counter is hidden. */
  loading?: boolean;
}

/** Displays the formatted total record count. */
export function RecordCounter(props: PRecordCounter) {
  const { totalSize, loading } = props;

  if (!loading) {
    return (
      <div className="tol-component-counter" data-testid="record-counter">
        {formatTotalSize(totalSize)}
      </div>
    );
  }
}
