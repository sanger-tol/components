/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { formatRecordRange, formatTotalSize, getRecordRange } from "..";

/** Props for the `RecordCounter` component. */
export interface PRecordCounter {
  /** Total number of records available. */
  totalSize: number;
  /** Current page, starting at 1. */
  page?: number;
  /** Number of records displayed per page. */
  pageSize?: number;
  /** Optional loading state. When true, the counter is hidden. */
  loading?: boolean;
}

/** Displays the current record range and formatted total record count. */
export function RecordCounter(props: PRecordCounter) {
  const { totalSize, page = 1, pageSize, loading } = props;

  if (!loading) {
    const { start, end } = getRecordRange(totalSize, page, pageSize);
    const formattedStart = start.toLocaleString();
    const formattedEnd = end.toLocaleString();
    const formattedTotal = totalSize.toLocaleString();
    const showRange = pageSize !== 1;
    const accessibleLabel = `Showing ${formattedStart} to ${formattedEnd} of ${formattedTotal} records`;

    return (
      <div
        className="tol-component-counter"
        data-testid="record-counter"
        aria-label={accessibleLabel}
        title={accessibleLabel}
      >
        {showRange ? formatRecordRange(start, end) : page.toLocaleString()} of {" "}
        {formatTotalSize(totalSize)}
      </div>
    );
  }
}
