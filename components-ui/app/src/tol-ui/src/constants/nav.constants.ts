/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export const PAGE_ACCESS: { [key: string]: string } = {
  /**
   * Open to all users
   */
  PUBLIC: "public",
  /**
   * Only logged in users can access
   */
  AUTHENTICATED: "authenticated",
  /**
   * Only logged in users with a role assigned, e.g. ['sanger']
   */
  ROLE_REQUIRED: "role_required",
} as const;

export const URL_PATHS: { [key: string]: string } = {
  HOME: "/",
  PAGE_NOT_FOUND: "/page-not-found",
  BOARD: "/board",
  MY_BOARDS: "/my-boards",
  PROFILE: "/user/a/b/c/d/e/f/profile",
} as const;
