/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/
import { PPopUpMessage } from "..";


enum Duration {
  success = 4000,
  info = 6000,
  warning = 8000,
  error = 10000,
  default = 6000,
}

export const getDuration = (type: PPopUpMessage["type"]) => {
  switch (type) {
    case "success":
      return Duration.success;
    case "info":
      return Duration.info;
    case "warning":
      return Duration.warning;
    case "error":
      return Duration.error;
    default:
      return Duration.default;
  }
};