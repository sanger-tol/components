/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  CellTooltip,
  PCell
} from "../..";


export function Float(props: PCell) {
  const { value } = props;

  return (
    <CellTooltip
      followCursor
      value={value.toFixed?.(2)}
      contents={value}
    />
  );
}
