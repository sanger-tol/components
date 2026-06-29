/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { MAX_VIEWS_ALLOWED, normaliseCaps } from "..";
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
  boardEntity: TBoardEntityType | string,
): { [key: string]: { [key: string]: string } } => {
  const entityCapitalised: string = normaliseCaps(boardEntity);

  return {
    BOARD_COPY: {
      ID_COPY: `${entityCapitalised} ID copied to clipboard.`,
      COPY_SUCCESS_REDIRECT: `${entityCapitalised} copied successfully. Redirecting to new ${entityCapitalised}...`,
      IMPORT_SUCCESS: `${entityCapitalised} imported successfully.`,
      IMPORT_ERROR: `Error importing ${entityCapitalised}. Please try again.`,
      NO_TITLE_ERROR: `Please provide a title for the new ${entityCapitalised}.`,
      COPY_FORBIDDEN: `You are not authorised to copy this ${entityCapitalised}.`,
      IMPORT_FORBIDDEN: `You are not authorised to import a ${entityCapitalised} on this board.`,
    },
    CLIPBOARD_COPY: {
      ID_COPY: `${entityCapitalised} ID copied to clipboard.`,
      URL_COPY: `${entityCapitalised} URL copied to clipboard.`,
    },
    UPDATE: {
      ERROR: `Error updating ${entityCapitalised}. Please try again.`,
      FORBIDDEN: `You are not authorised to update this ${entityCapitalised}.`,
    },
    FETCH: {
      ERROR: `Error fetching ${entityCapitalised} data. Please try again.`,
    },
    DELETE: {
      SUCCESS: `${entityCapitalised} deleted successfully.`,
      ERROR: `Error deleting ${entityCapitalised}. Please try again.`,
      FORBIDDEN: `You are not authorised to delete this ${entityCapitalised}.`,
    },
    ADD: {
      ERROR: `Error adding ${entityCapitalised}. Please try again.`,
      FORBIDDEN: `You are not authorised to add a ${entityCapitalised} to this board.`,
    },
    REORDER: {
      ERROR: `Error reordering ${entityCapitalised}. Please refresh the page and try again.`,
      FORBIDDEN: `You are not authorised to reorder this ${entityCapitalised}s.`,
    },
    CREATE: {
      ERROR: `Error creating ${entityCapitalised}. Please try again.`,
      FORBIDDEN: `You are not authorised to create a ${entityCapitalised}.`,
      MAX_LIMIT_ERROR: `A maximum of ${MAX_VIEWS_ALLOWED} Views are allowed per board.`,
    },
    MISC: {
      EMPTY_TITLE_ERROR: `${entityCapitalised} titles cannot be empty.`,
    },
    DIFF: {
      RESET_SUCCESS: `${entityCapitalised} configuration successfully reset to default.`,
      RESET_ERROR: `Error resetting ${entityCapitalised} configuration. Please try again.`,
    },
  } as const;
};

export const FORM_MESSAGE_TEXT = {
  PROFILE_FORM: {
    UPDATE_SUCCESS: "Profile updated successfully.",
    UPDATE_ERROR: "Failed to update profile.",
    PROFILE_REQUIRED: "You must have a completed profile to access this page.",
  },
};
