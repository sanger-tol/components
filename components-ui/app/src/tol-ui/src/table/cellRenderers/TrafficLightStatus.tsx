/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  PCellDisplay,
  StatusMessage,
  TMessageType
} from "../..";


export interface PTrafficLightStatus extends PCellDisplay {
  success?: boolean;
  warning?: boolean;
  danger?: boolean;
}

export function TrafficLightStatus(props: PTrafficLightStatus) {
  const {
    value,
    success = false,
    warning = false,
    danger = false,
  } = props;

  const status: TMessageType | undefined = (
    success
      ? "success"
      : warning
        ? "warning"
        : danger
          ? "error"
          : undefined
  );

  if (!status) return <>{value}</>;

  return (
    <StatusMessage
      message={value}
      status={status}
    />
  );
}
