/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export const MESSAGE_DURATION =  {
  SUCCESS: 4000,
  INFO: 6000,
  WARNING: 8000,
  ERROR: 10000,
  PERSIST: 10000000,
  DEFAULT: 6000,
} as const;

export const MESSAGE_TYPE = {
  SUCCESS: "success",
  INFO: "info",
  WARNING: "warning",
  ERROR: "error",
} as const;

export const MESSAGE_TEXT = {
  BOARD_COPY: {
    SUCCESS: "Board copied successfully! Redirecting to new board...",
    ERROR: "Failed to copy board. Please try again.",
    NO_TITLE_ERROR: "Please provide a title for the new board.",
  }
} as const;