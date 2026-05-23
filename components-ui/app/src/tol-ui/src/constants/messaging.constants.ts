/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { TBoardEntityType, TMessageType } from "..";

export const MESSAGE_DURATION: { [key: string]: number } = {
  SUCCESS: 4000,
  INFO: 6000,
  WARNING: 8000,
  ERROR: 10000,
  PERSIST: 10000000,
  DEFAULT: 6000,
} as const;

export const MESSAGE_TYPE: { [key: string]: TMessageType } = {
  SUCCESS: "success",
  INFO: "info",
  WARNING: "warning",
  ERROR: "error",
} as const;

export const BOARD_MESSAGE_TEXT = (
  boardEntity: TBoardEntityType,
): { [key: string]: { [key: string]: string } } => {
  const entityCapitalised: string =
    (boardEntity as string).charAt(0).toUpperCase() +
    (boardEntity as string).slice(1);

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
    UPDATE: {
      ERROR: `Error updating ${entityCapitalised}. Please try again.`,
    },
    FETCH: {
      ERROR: `Error fetching ${entityCapitalised} data. Please try again.`,
    },
    DELETE: {
      SUCCESS: `${entityCapitalised} deleted successfully.`,
      ERROR: `Error deleting ${entityCapitalised}. Please try again.`,
    },
    ADD: {
      ERROR: `Error adding ${entityCapitalised}. Please try again.`,
    },
    REORDER: {
      ERROR: `Error reordering ${entityCapitalised}. Please refresh the page and try again.`,
    },
  } as const;
};
