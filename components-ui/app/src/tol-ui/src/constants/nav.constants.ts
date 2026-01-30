/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export const PAGE_ACCESS = {
  /**
   * Open to all users, including non-logged in users
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
}
