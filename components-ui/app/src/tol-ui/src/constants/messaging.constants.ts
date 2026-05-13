/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { BOARDS } from ".";

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

export const BOARD_MESSAGE_TEXT = (
  boardEntity: (typeof BOARDS)[keyof typeof BOARDS],
) => {
  const entityCapitalised =
    boardEntity.charAt(0).toUpperCase() + boardEntity.slice(1);

  return {
    BOARD_COPY: {
      ID_COPY: `${entityCapitalised} ID copied to clipboard.`,
      COPY_SUCCESS_REDIRECT: `${entityCapitalised} copied successfully. Redirecting to new ${entityCapitalised}...`,
      IMPORT_SUCCESS: `${entityCapitalised} imported successfully.`,
      IMPORT_ERROR: `Error importing ${entityCapitalised}. Please try again.`,
      NO_TITLE_ERROR: `Please provide a title for the new ${entityCapitalised}.`,
    },
    CLIPBOARD_COPY: {
      ID_COPY: `${entityCapitalised} ID copied to clipboard.`,
      URL_COPY: `${entityCapitalised} URL copied to clipboard.`,
    },
  } as const;
};
