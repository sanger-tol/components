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
          "Nested Public Page": {
            access: "public",
            path: {
              pageElementReference: "nestedPublicPage",
              route: "/nested-public-page",
            },
          },
          "Nested Authenticated Page": {
            access: "authenticated",
            path: {
              pageElementReference: "nestedAuthenticatedPage",
              route: "/nested-authenticated-page",
            },
          },
        },
        order: ["Nested Public Page", "Nested Authenticated Page"],
      },
    },
    "Authenticated Dropdown": {
      access: "authenticated",
      pages: {
        data: {
          "Nested Public Page": {
            access: "public",
            path: {
              pageElementReference: "nestedPublicPage",
              route: "/nested-public-page",
            },
          },
          "Nested Authenticated Page": {
            access: "authenticated",
            path: {
              pageElementReference: "nestedAuthenticatedPage",
              route: "/nested-authenticated-page",
            },
          },
        },
        order: ["Nested Public Page", "Nested Authenticated Page"],
      },
    },
  },
  order: ["Public Page", "Authenticated Page", "Public Dropdown", "Authenticated Dropdown"],
};
