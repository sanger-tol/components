/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { TNavConfig } from "../../../tol-ui/src";

export const navInputConfigMock: TNavConfig = {
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
      },
    },
    "Role Required Page": {
      access: "role_required",
      path: {
        pageElementReference: "roleRequiredPage",
      },
    },
    "Admin Page": {
      access: ["admin"],
      path: {
        pageElementReference: "adminPage",
      },
    },
    "Super Admin Page": {
      access: ["super-admin"],
      path: {
        pageElementReference: "superAdminPage",
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
            },
          },
          "Public Dropdown Authenticated Page": {
            access: "authenticated",
            path: {
              pageElementReference: "publicDropdownAuthenticatedPage",
            },
          },
          "Public Dropdown Role Required Page": {
            access: "role_required",
            path: {
              pageElementReference: "publicDropdownRoleRequiredPage",
            },
          },
          "Public Dropdown Admin Page": {
            access: ["admin"],
            path: {
              pageElementReference: "publicDropdownAdminPage",
            },
          },
          "Public Dropdown Super Admin Page": {
            access: ["super-admin"],
            path: {
              pageElementReference: "publicDropdownSuperAdminPage",
            },
          },
        },
        order: [
          "Public Dropdown Public Page",
          "Public Dropdown Authenticated Page",
          "Public Dropdown Role Required Page",
          "Public Dropdown Admin Page",
          "Public Dropdown Super Admin Page",
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
            },
          },
          "Authenticated Dropdown Authenticated Page": {
            access: "authenticated",
            path: {
              pageElementReference: "authenticatedDropdownAuthenticatedPage",
            },
          },
          "Authenticated Dropdown Role Required Page": {
            access: "role_required",
            path: {
              pageElementReference: "authenticatedDropdownRoleRequiredPage",
            },
          },
          "Authenticated Dropdown Admin Page": {
            access: ["admin"],
            path: {
              pageElementReference: "authenticatedDropdownAdminPage",
            },
          },
          "Authenticated Dropdown Super Admin Page": {
            access: ["super-admin"],
            path: {
              pageElementReference: "authenticatedDropdownSuperAdminPage",
            },
          },
        },
        order: [
          "Authenticated Dropdown Public Page",
          "Authenticated Dropdown Authenticated Page",
          "Authenticated Dropdown Role Required Page",
          "Authenticated Dropdown Admin Page",
          "Authenticated Dropdown Super Admin Page",
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
            },
          },
          "Role Required Dropdown Authenticated Page": {
            access: "authenticated",
            path: {
              pageElementReference: "roleRequiredDropdownAuthenticatedPage",
            },
          },
          "Role Required Dropdown Role Required Page": {
            access: "role_required",
            path: {
              pageElementReference: "roleRequiredDropdownRoleRequiredPage",
            },
          },
          "Role Required Dropdown Admin Page": {
            access: ["admin"],
            path: {
              pageElementReference: "roleRequiredDropdownAdminPage",
            },
          },
          "Role Required Dropdown Super Admin Page": {
            access: ["super-admin"],
            path: {
              pageElementReference: "roleRequiredDropdownSuperAdminPage",
            },
          },
        },
        order: [
          "Role Required Dropdown Public Page",
          "Role Required Dropdown Authenticated Page",
          "Role Required Dropdown Role Required Page",
          "Role Required Dropdown Admin Page",
          "Role Required Dropdown Super Admin Page",
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
            },
          },
          "Admin Dropdown Authenticated Page": {
            access: "authenticated",
            path: {
              pageElementReference: "adminDropdownAuthenticatedPage",
            },
          },
          "Admin Dropdown Role Required Page": {
            access: "role_required",
            path: {
              pageElementReference: "adminDropdownRoleRequiredPage",
            },
          },
          "Admin Dropdown Admin Page": {
            access: ["admin"],
            path: {
              pageElementReference: "adminDropdownAdminPage",
            },
          },
          "Admin Dropdown Super Admin Page": {
            access: ["super-admin"],
            path: {
              pageElementReference: "adminDropdownSuperAdminPage",
            },
          },
        },
        order: [
          "Admin Dropdown Public Page",
          "Admin Dropdown Authenticated Page",
          "Admin Dropdown Role Required Page",
          "Admin Dropdown Admin Page",
          "Admin Dropdown Super Admin Page",
        ],
      },
    },

    "Super Admin Dropdown": {
      access: ["super-admin"],
      pages: {
        data: {
          "Super Admin Dropdown Public Page": {
            access: "public",
            path: {
              pageElementReference: "superAdminDropdownPublicPage",
            },
          },
          "Super Admin Dropdown Authenticated Page": {
            access: "authenticated",
            path: {
              pageElementReference: "superAdminDropdownAuthenticatedPage",
            },
          },
          "Super Admin Dropdown Role Required Page": {
            access: "role_required",
            path: {
              pageElementReference: "superAdminDropdownRoleRequiredPage",
            },
          },
          "Super Admin Dropdown Admin Page": {
            access: ["admin"],
            path: {
              pageElementReference: "superAdminDropdownAdminPage",
            },
          },
          "Super Admin Dropdown Super Admin Page": {
            access: ["super-admin"],
            path: {
              pageElementReference: "superAdminDropdownSuperAdminPage",
            },
          },
        },
        order: [
          "Super Admin Dropdown Public Page",
          "Super Admin Dropdown Authenticated Page",
          "Super Admin Dropdown Role Required Page",
          "Super Admin Dropdown Admin Page",
          "Super Admin Dropdown Super Admin Page",
        ],
      },
    },
  },
  order: [
    "Public Page",
    "Authenticated Page",
    "Role Required Page",
    "Admin Page",
    "Super Admin Page",
    "Public Dropdown",
    "Authenticated Dropdown",
    "Role Required Dropdown",
    "Admin Dropdown",
    "Super Admin Dropdown",
  ],
};