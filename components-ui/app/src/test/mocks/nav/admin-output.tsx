/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { TNavConfig } from "../../../tol-ui/src";

export const navOutputConfigAdminMock: TNavConfig = {
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
    "Admin Page": {
      access: ["admin"],
      path: {
        pageElementReference: "adminPage",
        route: "/admin-page",
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
          "Nested Admin Page": {
            access: ["admin"],
            path: {
              pageElementReference: "nestedAdminPage",
              route: "/nested-admin-page",
            },
          },
        },
        order: ["Nested Public Page", "Nested Authenticated Page", "Nested Admin Page"],
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
          "Nested Admin Page": {
            access: ["admin"],
            path: {
              pageElementReference: "nestedAdminPage",
              route: "/nested-admin-page",
            },
          },
        },
        order: ["Nested Public Page", "Nested Authenticated Page", "Nested Admin Page"],
      },
    },
    "Admin Dropdown": {
      access: ["admin"],
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
          "Nested Admin Page": {
            access: ["admin"],
            path: {
              pageElementReference: "nestedAdminPage",
              route: "/nested-admin-page",
            },
          },
        },
        order: ["Nested Public Page", "Nested Authenticated Page", "Nested Admin Page"],
      },
    },
  },
  order: [
    "Public Page",
    "Authenticated Page",
    "Admin Page",
    "Public Dropdown",
    "Authenticated Dropdown",
    "Admin Dropdown",
  ],
};
