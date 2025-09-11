/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { formatTotalSize } from "..";


interface PRowCounter {
  totalSize: number;
  loading: boolean;
}

export function RowCounter(props: PRowCounter) {
  const { totalSize, loading } = props;

  if (loading) return null;

  return (
    <div className="tol-table-row-counter">
      {formatTotalSize(totalSize)}
    </div>
  );
}
