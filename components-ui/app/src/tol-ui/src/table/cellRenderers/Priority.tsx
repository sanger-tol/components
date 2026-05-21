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
    "Highest", <Icon icon="angles-up" colour="red" />
  ] : high ? [
    "High", <Icon icon="angle-up" colour="red" />
  ] : medium ? [
    "Medium", <Icon icon="equals" colour="orange" />
  ] : low ? [
    "Low", <Icon icon="angle-down" colour="blue" />
  ] : lowest ? [
    "Lowest", <Icon icon="angles-down" colour="blue" />
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
