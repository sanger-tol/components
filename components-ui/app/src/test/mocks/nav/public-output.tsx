/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { TNavConfig } from "../../../tol-ui/src";

export const navOutputConfigPublicMock: TNavConfig = {
  data: {
    "Public Page": {
      access: "public",
      path: {
        pageElementReference: "publicPage",
        route: "/",
      },
    },
    "Public Dropdown": {
      access: "public",
      pages: {
        data: {
          "Nested Public Page": {
            access: "public",
            path: {
              pageElementReference: "nestedPublicPage",
              route: "/nested-public-page",
            },
          },
        },
        order: ["Nested Public Page"],
      },
    },
  },
  order: ["Public Page", "Public Dropdown"],
};
