/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

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

/**
 * Base interface for navigation items
 */
export interface INavBase {
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

/**
 * A single leaf page in the navigation tree
 */
export interface INavPage extends INavBase {
  /**
   * Either a page element reference or a boardId
   */
  pageReference: string;
}

/**
 * A dropdown containing a collection of pages.
 */
export interface INavDropdown extends INavBase {
  /**
   * A group of pages within a dropdown, keyed by page nav name.
   */
  pages: INavCollection<INavPage>;
}

/**
 * A named, ordered collection of items, keyed by their nav name.
 *
 * The keys of `data` are the nav names, e.g. "Extractions".
 */
export interface INavCollection<TItem> {
  /**
   * Items keyed by their nav name
   */
  data: Record<string, TItem>;
  /**
   * Display order of the keys in `data`
   */
  order: string[];
}

/**
 * A top‑level navigation item can be either a page or a dropdown.
 */
export type TRootNavItem = INavPage | INavDropdown;

/**
 * The full navigation configuration.
 */
export type INavConfig = INavCollection<TRootNavItem>;

export const EXAMPLE: INavConfig = {
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
            pageReference: "el1"
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
      pageReference: "el1"
    }
  },
  order: ["Dropdown Example", "Page Example 1"]
};