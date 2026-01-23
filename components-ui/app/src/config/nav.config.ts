/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { TNavConfig } from "../tol-ui/src";

export const navConfig: TNavConfig = {
  data: {
    "Developer": {
      access: "public",
      pages: {
        data: {
          "Code Style Guide": {
            path: {
              route: "species"
            },
            access: "public",
            pageElementReference: "b_123456"
          },
          "How To Document": {
            access: "public",
            pageElementReference: "howToDocument"
          }
        },
        order: ["Code Style Guide", "How To Document"]
      }
    }
  },
  order: ["Developer"]
};