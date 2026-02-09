/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { TNavConfig } from "..";

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
        access: "public",
        path: {
          pageElementReference: "validationResultsDetail",
          route: "/file-validation/results/:uploadId",
        },
      },
      "Callback": {
        access: "public",
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
      access: "public",
      path: {
        pageElementReference: "boardDetail",
        route: "/board/:boardId",
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
    data: {},
    order: [],
  }

  if (configurableBoards) {
    config.data["My Boards"] = {
      access: "role_required",
      path: {
        pageElementReference: "myBoards",
        route: "/my-boards",
      },
    }
    config.order.push("My Boards");
  }

  return config;
}
