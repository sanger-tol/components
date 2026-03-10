/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { TMessageType, MESSAGE_DURATION } from "..";

export function getDuration(type: TMessageType | "persist") {
  switch (type) {
    case "success":
      return MESSAGE_DURATION.SUCCESS;
    case "info":
      return MESSAGE_DURATION.INFO;
    case "warning":
      return MESSAGE_DURATION.WARNING;
    case "error":
      return MESSAGE_DURATION.ERROR;
      case "persist":
        return MESSAGE_DURATION.PERSIST;
    default:
      return MESSAGE_DURATION.DEFAULT;
  }
};
