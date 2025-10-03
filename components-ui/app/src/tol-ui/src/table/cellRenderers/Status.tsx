/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  PCell,
  StatusMessage,
  TMessageType
} from "../..";


export interface PBoolean extends PCell {
  info?: boolean;
  success?: boolean;
  warning?: boolean;
  danger?: boolean;
}

export function Status(props: PBoolean) {
  const {
    value,
    info = false,
    success = false,
    warning = false,
    danger = false,
  } = props;

  const status: TMessageType | undefined = (
    info
      ? "info"
      : success
        ? "success"
        : warning
          ? "warning"
          : danger
            ? "error"
            : undefined
  );

  if (!status) return <>STATUS: {value}</>;

  return value.map((val, index) => (
    <StatusMessage
      key={index}
      message={val}
      status={status}
    />
  ));
}
