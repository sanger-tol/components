/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { TNavConfig } from "../../tol-ui/src";

export const navConfigMock: TNavConfig = {
  data: {
    "Home": {
      access: "public",
      path: {
        pageElementReference: "home",
        route: "/"
      }
    },
    "Dropdown Name 1": {
      access: "public",
      pages: {
        data: {
          "Page Name 1": {
            access: "public",
            path: {
              pageElementReference: "page1",
            },
          },
          "Dropdown Name 2": {
            access: "public",
            pages: {
              data: {
                "Page Name 2": {
                  access: "public",
                  path: {
                    pageElementReference: "page2",
                  },
                },
              },
              order: ["Page Name 2"]
            }
          }
        },
        order: ["Page Name 1", "Dropdown Name 2"]
      }
    }
  },
  order: ["Home", "Dropdown Name 1"]
};
