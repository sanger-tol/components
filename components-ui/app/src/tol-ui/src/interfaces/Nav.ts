/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export interface INavBase {
  /**
   * The name of the page or dropdown
   */
  name: string;
  /**
   * The route or link for the page
   */
  path?: TPagePath;
  /**
   * The access level required to view the page
   */
  access: TPageAccess;
  /**
   * Whether to hide this page from the navigation
   */
  hideInNav?: boolean;
}

export interface IPage extends INavBase {
  /**
   * Either a page element reference or a boardId
   */
  key: string;
}

export interface INavDropdown extends INavBase {
  /**
   * A group of pages within a dropdown
   */
  pages: IPage[];
}

export type TPageAccess =
  /**
   * Open to all users, including non-logged in users
   */
  "public" |
  /**
   * Only logged in users can access
   */
  "authenticated" |
  /**
   * Array of roles that can access, e.g. ['tol-lab']
   */
  string[];

export type TPagePath = IPageRoute | IPageLink;

export interface IPageRoute {
  /**
   * The route path within the app
   */
  route: string;
}

export interface IPageLink {
  /**
   * The external link URL
   */
  href: string;
  /**
   * Whether to open the link in a new tab/window
   */
  target?: string;
}







export const EXAMPLE = {
  data: {
    "Dropdown Example 1": {
      path: {
        route: "/dropdown-path"
      },
      access: "public",
      pages: {
        data: {
          "Page Example 2": {
            path: {
              route: "/page-example"
            },
            access: "public",
            key: "el1"
          }
        },
        order: ["Page Example 2"]
      }
    },
    "Page Example 1": {
      path: {
        route: "/page-example"
      },
      access: "public",
      key: "el1"
    }
  },
  order: ["Dropdown Example", "Page Example 1"]
}
