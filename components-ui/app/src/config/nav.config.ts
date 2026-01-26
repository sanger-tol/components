/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { TNavConfig } from "../tol-ui/src";

export const navConfig: TNavConfig = {
  data: {
    "Home": {
      access: "public",
      path: {
        pageElementReference: "home",
        route: "/"
      }
    },
    "Developer": {
      access: "public",
      pages: {
        data: {
          "Code Style Guide": {
            access: "public",
            path: {
              pageElementReference: "codeStyleGuide",
            },
          },
          "How To Document": {
            access: "public",
            path: {
              pageElementReference: "howToDocument",
            },
          }
        },
        order: ["Code Style Guide", "How To Document"]
      }
    }
  },
  order: ["Home", "Developer"]
};