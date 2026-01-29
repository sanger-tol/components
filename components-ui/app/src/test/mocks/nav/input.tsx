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
        route: "/"
      }
    },
    "Authenticated Page": {
      access: "authenticated",
      path: {
        pageElementReference: "authenticatedPage",
      }
    },
    "Admin Page": {
      access: ["admin"],
      path: {
        pageElementReference: "adminPage",
      }
    },
    "Super Admin Page": {
      access: ["super-admin"],
      path: {
        pageElementReference: "superAdminPage",
      }
    },
    "Public Dropdown": {
      access: "public",
      pages: {
        data: {
          "Nested Public Page": {
            access: "public",
            path: {
              pageElementReference: "nestedPublicPage",
            },
          },
          "Nested Authenticated Page": {
            access: "authenticated",
            path: {
              pageElementReference: "nestedAuthenticatedPage",
            },
          },
          "Nested Admin Page": {
            access: ["admin"],
            path: {
              pageElementReference: "nestedAdminPage",
            },
          },
          "Nested Super Admin Page": {
            access: ["super-admin"],
            path: {
              pageElementReference: "nestedSuperAdminPage",
            },
          },
        },
        order: ["Nested Public Page", "Nested Authenticated Page", "Nested Admin Page", "Nested Super Admin Page"]
      }
    },
    "Authenticated Dropdown": {
      access: "authenticated",
      pages: {
        data: {
          "Nested Public Page": {
            access: "public",
            path: {
              pageElementReference: "nestedPublicPage",
            },
          },
          "Nested Authenticated Page": {
            access: "authenticated",
            path: {
              pageElementReference: "nestedAuthenticatedPage",
            },
          },
          "Nested Admin Page": {
            access: ["admin"],
            path: {
              pageElementReference: "nestedAdminPage",
            },
          },
          "Nested Super Admin Page": {
            access: ["super-admin"],
            path: {
              pageElementReference: "nestedSuperAdminPage",
            },
          },
        },
        order: ["Nested Public Page", "Nested Authenticated Page", "Nested Admin Page", "Nested Super Admin Page"]
      }
    },
    "Admin Dropdown": {
      access: ["admin"],
      pages: {
        data: {
          "Nested Public Page": {
            access: "public",
            path: {
              pageElementReference: "nestedPublicPage",
            },
          },
          "Nested Authenticated Page": {
            access: "authenticated",
            path: {
              pageElementReference: "nestedAuthenticatedPage",
            },
          },
          "Nested Admin Page": {
            access: ["admin"],
            path: {
              pageElementReference: "nestedAdminPage",
            },
          },
          "Nested Super Admin Page": {
            access: ["super-admin"],
            path: {
              pageElementReference: "nestedSuperAdminPage",
            },
          },
        },
        order: ["Nested Public Page", "Nested Authenticated Page", "Nested Admin Page", "Nested Super Admin Page"]
      }
    },
    "Super Admin Dropdown": {
      access: ["super-admin"],
      pages: {
        data: {
          "Nested Public Page": {
            access: "public",
            path: {
              pageElementReference: "nestedPublicPage",
            },
          },
          "Nested Authenticated Page": {
            access: "authenticated",
            path: {
              pageElementReference: "nestedAuthenticatedPage",
            },
          },
          "Nested Admin Page": {
            access: ["admin"],
            path: {
              pageElementReference: "nestedAdminPage",
            },
          },
          "Nested Super Admin Page": {
            access: ["super-admin"],
            path: {
              pageElementReference: "nestedSuperAdminPage",
            },
          },
        },
        order: ["Nested Public Page", "Nested Authenticated Page", "Nested Admin Page", "Nested Super Admin Page"]
      }
    },
  },
  order: ["Public Page", "Authenticated Page", "Admin Page", "Public Dropdown", "Authenticated Dropdown", "Admin Dropdown", "Super Admin Dropdown"]
};

