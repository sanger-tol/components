/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { PAGE_ACCESS, TNavConfig, URL_PATHS } from "..";

/**
 * Builds the system-default navigation configuration.
 *
 * @param configurableBoards - Whether to include the `"Boards"` navigation entry.
 * @returns The default {@link TNavConfig} for the system.
 */
export const getSystemDefaultNavConfig = (
  configurableBoards: boolean
): TNavConfig => {
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
    },
    // Not included in order => not shown in the main navigation
    order: [],
  }

  if (configurableBoards) {
    config.data["Boards"] = {
      access: PAGE_ACCESS.PUBLIC,
      path: {
        pageElementReference: "boardDetail",
        route: `${URL_PATHS.BOARD}/:boardId`,
      },
    }
  }

  return config;
}


/**
 * Builds the default navigation configuration for a user's profile.
 *
 * @param configurableBoards - When `true`, includes the "My Boards" entry in the config.
 * @returns A {@link TNavConfig} for the profile section of the app.
 */
export const getProfileDefaultNavConfig = (
  configurableBoards: boolean
): TNavConfig => {
  const config: TNavConfig = {
    data: {
      Profile: {
        access: PAGE_ACCESS.AUTHENTICATED,
        path: {
          pageElementReference: "profile",
          route: URL_PATHS.PROFILE,
        },
      },
    },
    order: ["Profile"],
  }

  if (configurableBoards) {
    config.data["My Boards"] = {
      access: PAGE_ACCESS.ROLE_REQUIRED,
      path: {
        pageElementReference: "myBoards",
        route: URL_PATHS.MY_BOARDS,
      },
    }
    config.order.push("My Boards");
  }

  return config;
}
