/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { CellTooltip, Icon, PCellDisplay } from "../..";

export interface PPriority extends PCellDisplay {
  /**
   * `true` if the condition for "highest" has been fulfilled
   */
  highest?: boolean;
  /**
   * `true` if the condition for "high" has been fulfilled
   */
  high?: boolean;
  /**
   * `true` if the condition for "medium" has been fulfilled
   */
  medium?: boolean;
  /**
   * `true` if the condition for "low" has been fulfilled
   */
  low?: boolean;
  /**
   * `true` if the condition for "lowest" has been fulfilled
   */
  lowest?: boolean;
}

/**
 * Renders an icon representing a priority.
 * 
 * There are 5 priority levels (in descending order): highest, high, medium, low, and lowest.
 * The icon rendered depends on the which condition is met.
 * While multiple conditions can be fulfilled at the same time,
 * only the one representing the highest of the available priorities is rendered.
 */
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
