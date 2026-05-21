/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { CellTooltip, Icon, PCellDisplay } from "../..";

export interface PPriority extends PCellDisplay {
  highest?: boolean;
  high?: boolean;
  medium?: boolean;
  low?: boolean;
  lowest?: boolean;
}

export function Priority(props: PPriority) {
  const {
    value,
    highest = false,
    high = false,
    medium = false,
    low = false,
    lowest = false,
  } = props;

  const [name, icon, colour] = highest ? [
    "Highest Priority", "angles-up", "red"
  ] : high ? [
    "High Priority", "angle-up", "red"
  ] : medium ? [
    "Medium Priority", "equals", "orange"
  ] : low ? [
    "Low Priority", "angle-down", "blue"
  ] : lowest ? [
    "Lowest Priority", "angles-down", "blue"
  ] : [
    null, null, null
  ];

  return (
    icon ? (
      <CellTooltip
        followCursor
        value={<Icon icon={icon} colour={colour} />}
        contents={name}
      />
    ) : (
      <>{value}</>
    )
  )
}
