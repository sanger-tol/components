/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { TNavConfig } from "..";

export const systemDefaultNavConfig: TNavConfig = {
  data: {
    "Board": {
      access: "public",
      path: {
        pageElementReference: "boardDetail",
        route: "/board/:boardId",
      },
    },
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
};

export const profileDefaultNavConfig: TNavConfig = {
  data: {
    "My Boards": {
      access: "role_required",
      path: {
        pageElementReference: "myBoards",
        route: "/my-boards",
      },
    },
  },
  order: ["My Boards"],
};
