/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export const MESSAGE_DURATION = {
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

export const BOARD_MESSAGE_TEXT = (boardEntity: string) => {
  return {
    BOARD_COPY: {
      ID_COPY: `${boardEntity} ID copied to clipboard`,
      LINK_COPY: `${boardEntity} link copied to clipboard`,
      BOARD_COPY_SUCCESS:
        "Board copied successfully. Redirecting to new board...",
      COPY_SUCCESS: `${boardEntity} copied successfully.`,
      COPY_ERROR: `Error copying ${boardEntity}. Please try again.`,
      NO_TITLE_ERROR: `Please provide a title for the new ${boardEntity}.`,
    },
  } as const;
};
