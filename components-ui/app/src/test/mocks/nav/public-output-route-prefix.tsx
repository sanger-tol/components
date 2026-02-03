/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { TNavConfig } from "../../../tol-ui/src";

export const navOutputConfigPublicRoutePrefixMock: TNavConfig = {
  data: {
    "Public Page": {
      access: "public",
      path: {
        pageElementReference: "publicPage",
        route: "/v2/",
      },
    },

    "Public Dropdown": {
      access: "public",
      pages: {
        data: {
          "Public Dropdown Public Page": {
            access: "public",
            path: {
              pageElementReference: "publicDropdownPublicPage",
              route: "/v2/public-dropdown-public-page",
            },
          },
        },
        order: ["Public Dropdown Public Page"],
      },
    },
  },
  order: ["Public Page", "Public Dropdown"],
};