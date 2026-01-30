/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { TNavConfig } from "../../../tol-ui/src";

export const navOutputConfigAuthenticatedMock: TNavConfig = {
  data: {
    "Public Page": {
      access: "public",
      path: {
        pageElementReference: "publicPage",
        route: "/",
      },
    },

    "Authenticated Page": {
      access: "authenticated",
      path: {
        pageElementReference: "authenticatedPage",
        route: "/authenticated-page",
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
              route: "/public-dropdown-public-page",
            },
          },
          "Public Dropdown Authenticated Page": {
            access: "authenticated",
            path: {
              pageElementReference: "publicDropdownAuthenticatedPage",
              route: "/public-dropdown-authenticated-page",
            },
          },
        },
        order: ["Public Dropdown Public Page", "Public Dropdown Authenticated Page"],
      },
    },

    "Authenticated Dropdown": {
      access: "authenticated",
      pages: {
        data: {
          "Authenticated Dropdown Public Page": {
            access: "public",
            path: {
              pageElementReference: "authenticatedDropdownPublicPage",
              route: "/authenticated-dropdown-public-page",
            },
          },
          "Authenticated Dropdown Authenticated Page": {
            access: "authenticated",
            path: {
              pageElementReference: "authenticatedDropdownAuthenticatedPage",
              route: "/authenticated-dropdown-authenticated-page",
            },
          },
        },
        order: [
          "Authenticated Dropdown Public Page",
          "Authenticated Dropdown Authenticated Page",
        ],
      },
    },
  },
  order: ["Public Page", "Authenticated Page", "Public Dropdown", "Authenticated Dropdown"],
};