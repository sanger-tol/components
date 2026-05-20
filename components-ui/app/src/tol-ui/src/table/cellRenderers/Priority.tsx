/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Icon, PCellDisplay } from "../..";

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

  return (
    highest ? (
      <Icon
        icon="angles-up"
        colour="red"
      />
    ) : high ? (
      <Icon
        icon="angle-up"
        colour="red"
      />
    ) : medium ? (
      <Icon
        icon="equals"
        colour="orange"
      />
    ) : low ? (
      <Icon
        icon="angle-down"
        colour="lightblue"
      />
    ) : lowest ? (
      <Icon
        icon="angles-down"
        colour="lightblue"
      />
    ) : (
      <>{value}</>
    )
  )
}
