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

  const [priorityName, PriorityIcon] = highest ? [
    "Highest Priority", <Icon icon="angles-up" colour="red" />
  ] : high ? [
    "High Priority", <Icon icon="angle-up" colour="red" />
  ] : medium ? [
    "Medium Priority", <Icon icon="equals" colour="orange" />
  ] : low ? [
    "Low Priority", <Icon icon="angle-down" colour="blue" />
  ] : lowest ? [
    "Lowest Priority", <Icon icon="angles-down" colour="blue" />
  ] : [
    null, null
  ];

  return (
    PriorityIcon ? (
      <CellTooltip
        followCursor
        value={PriorityIcon}
        contents={priorityName}
      />
    ) : (
      <>{value}</>
    )
  )
}
