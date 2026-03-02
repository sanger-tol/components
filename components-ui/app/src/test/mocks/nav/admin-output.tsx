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

    "Role Required Page": {
      access: "role_required",
      path: {
        pageElementReference: "roleRequiredPage",
        route: "/role-required-page",
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
          "Public Dropdown Admin Page": {
            access: ["admin"],
            path: {
              pageElementReference: "publicDropdownAdminPage",
              route: "/public-dropdown-admin-page",
            },
          },
        },
        order: [
          "Public Dropdown Public Page",
          "Public Dropdown Authenticated Page",
          "Public Dropdown Role Required Page",
          "Public Dropdown Admin Page",
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
          "Authenticated Dropdown Admin Page": {
            access: ["admin"],
            path: {
              pageElementReference: "authenticatedDropdownAdminPage",
              route: "/authenticated-dropdown-admin-page",
            },
          },
        },
        order: [
          "Authenticated Dropdown Public Page",
          "Authenticated Dropdown Authenticated Page",
          "Authenticated Dropdown Role Required Page",
          "Authenticated Dropdown Admin Page",
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
          "Role Required Dropdown Admin Page": {
            access: ["admin"],
            path: {
              pageElementReference: "roleRequiredDropdownAdminPage",
              route: "/role-required-dropdown-admin-page",
            },
          },
        },
        order: [
          "Role Required Dropdown Public Page",
          "Role Required Dropdown Authenticated Page",
          "Role Required Dropdown Role Required Page",
          "Role Required Dropdown Admin Page",
        ],
      },
    },

    "Admin Dropdown": {
      access: ["admin"],
      pages: {
        data: {
          "Admin Dropdown Public Page": {
            access: "public",
            path: {
              pageElementReference: "adminDropdownPublicPage",
              route: "/admin-dropdown-public-page",
            },
          },
          "Admin Dropdown Authenticated Page": {
            access: "authenticated",
            path: {
              pageElementReference: "adminDropdownAuthenticatedPage",
              route: "/admin-dropdown-authenticated-page",
            },
          },
          "Admin Dropdown Role Required Page": {
            access: "role_required",
            path: {
              pageElementReference: "adminDropdownRoleRequiredPage",
              route: "/admin-dropdown-role-required-page",
            },
          },
          "Admin Dropdown Admin Page": {
            access: ["admin"],
            path: {
              pageElementReference: "adminDropdownAdminPage",
              route: "/admin-dropdown-admin-page",
            },
          },
        },
        order: [
          "Admin Dropdown Public Page",
          "Admin Dropdown Authenticated Page",
          "Admin Dropdown Role Required Page",
          "Admin Dropdown Admin Page",
        ],
      },
    },
  },
  order: [
    "Public Page",
    "Authenticated Page",
    "Role Required Page",
    "Admin Page",
    "Public Dropdown",
    "Authenticated Dropdown",
    "Role Required Dropdown",
    "Admin Dropdown",
  ],
};