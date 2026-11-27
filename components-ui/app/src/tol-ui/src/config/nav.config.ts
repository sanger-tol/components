/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { PAGE_ACCESS, TNavConfig, URL_PATHS, USER_ROLES } from "..";

/**
 * Builds the system-default navigation configuration.
 *
 * @returns The default {@link TNavConfig} for the system.
 */
export const getSystemDefaultNavConfig = (): TNavConfig => {
  const config: TNavConfig = {
    data: {
      "File Validation Results": {
        access: PAGE_ACCESS.AUTHENTICATED,
        path: {
          pageElementReference: "validationResultsDetail",
          route: "/file-validation/results/:uploadId",
        },
      },
      "Callback": {
        access: PAGE_ACCESS.PUBLIC,
        path: {
          pageElementReference: "callback",
          route: "/callback",
        },
      },
      "Boards": {
        access: PAGE_ACCESS.PUBLIC,
        path: {
          pageElementReference: "boardDetail",
          route: `${URL_PATHS.BOARD}/:boardId`,
        },
      },
    },
    // Not included in order => not shown in the main navigation
    order: [],
  }

  return config;
}


/**
 * Builds the default navigation configuration for a user's profile.
 *
 * @returns A {@link TNavConfig} for the profile section of the app.
 */
export const getProfileDefaultNavConfig = (): TNavConfig => {
  const config: TNavConfig = {
    data: {
      Profile: {
        access: PAGE_ACCESS.AUTHENTICATED,
        path: {
          pageElementReference: "profile",
          route: URL_PATHS.PROFILE,
        },
      },
      "My Boards": {
        /** Only accessible by users with the WARDEN role by default; configurable by the app. */
        access: USER_ROLES.WARDEN,
        path: {
          pageElementReference: "myBoards",
          route: URL_PATHS.MY_BOARDS,
        },
      },
    },
    order: ["Profile", "My Boards"],
  }

  return config;
}
