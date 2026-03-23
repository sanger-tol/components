/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  CellTooltip,
  PCellDisplay
} from "../..";


export function Float(props: PCellDisplay) {
  const { value } = props;

  return (
    <CellTooltip
      followCursor
      value={value.toFixed?.(2)}
      contents={value}
    />
  );
}
