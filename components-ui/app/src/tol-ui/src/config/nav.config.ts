/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { TNavConfig } from "..";

export const systemNavConfig: TNavConfig = {
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
