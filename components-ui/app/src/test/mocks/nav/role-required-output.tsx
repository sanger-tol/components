/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { TNavConfig } from "../../../tol-ui/src";

export const navOutputConfigRoleRequiredMock: TNavConfig = {
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

    "Role Required Page": {
      access: "role_required",
      path: {
        pageElementReference: "roleRequiredPage",
        route: "/role-required-page",
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
          "Public Dropdown Role Required Page": {
            access: "role_required",
            path: {
              pageElementReference: "publicDropdownRoleRequiredPage",
              route: "/public-dropdown-role-required-page",
            },
          },
        },
        order: [
          "Public Dropdown Public Page",
          "Public Dropdown Authenticated Page",
          "Public Dropdown Role Required Page",
        ],
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
          "Authenticated Dropdown Role Required Page": {
            access: "role_required",
            path: {
              pageElementReference: "authenticatedDropdownRoleRequiredPage",
              route: "/authenticated-dropdown-role-required-page",
            },
          },
        },
        order: [
          "Authenticated Dropdown Public Page",
          "Authenticated Dropdown Authenticated Page",
          "Authenticated Dropdown Role Required Page",
        ],
      },
    },

    "Role Required Dropdown": {
      access: "role_required",
      pages: {
        data: {
          "Role Required Dropdown Public Page": {
            access: "public",
            path: {
              pageElementReference: "roleRequiredDropdownPublicPage",
              route: "/role-required-dropdown-public-page",
            },
          },
          "Role Required Dropdown Authenticated Page": {
            access: "authenticated",
            path: {
              pageElementReference: "roleRequiredDropdownAuthenticatedPage",
              route: "/role-required-dropdown-authenticated-page",
            },
          },
          "Role Required Dropdown Role Required Page": {
            access: "role_required",
            path: {
              pageElementReference: "roleRequiredDropdownRoleRequiredPage",
              route: "/role-required-dropdown-role-required-page",
            },
          },
        },
        order: [
          "Role Required Dropdown Public Page",
          "Role Required Dropdown Authenticated Page",
          "Role Required Dropdown Role Required Page",
        ],
      },
    },
  },
  order: [
    "Public Page",
    "Authenticated Page",
    "Role Required Page",
    "Public Dropdown",
    "Authenticated Dropdown",
    "Role Required Dropdown",
  ],
};