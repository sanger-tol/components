/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { formatTotalSize } from "..";


export interface PRowCounter {
  /**
   * Total number of rows available for the table.
   */
  totalSize: number;
  /**
   * Optional loading state. When true, the counter is hidden.
   */
  loading?: boolean;
}

/**
 * Displays the formatted total row count for a table.
 */
export function RowCounter(props: PRowCounter) {
  const { totalSize, loading } = props;

  if (!loading) {
    return (
      <div className="tol-table-row-counter" data-testid="table-row-counter">
        {formatTotalSize(totalSize)}
      </div>
    );
  }
}
