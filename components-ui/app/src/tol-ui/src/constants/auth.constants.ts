/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export const PRIVILEGE = {
  BOARD: {
    WRITABLE: "writable",
    VIEWABLE: "viewable"
  }
} as const;

export const USER_ROLES = {
  WARDEN: "warden",
} as const;