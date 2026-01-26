/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export type TPagePath = IPageElement | IPageLink;

export interface IPageElement {
  /**
   * Reference to a specific page element or boardId
   * Optional for dropdowns
   */
  pageElementReference?: string;
  /**
   * The route path within the app
   * Will default to the name of the nav item in implementation
   */
  route?: string;
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
 * Base interface for navigation page items
 */
export interface IPage {
  /**
   * The access level required to view the page
   */
  access: TPageAccess;
  /**
   * The route or link for the page
   */
  path?: TPagePath;
}

/**
 * A dropdown containing a collection of pages.
 */
export interface INavDropdown extends IPage {
  /**
   * A group of pages within a dropdown, keyed by page nav display name.
   */
  pages: INavCollection<TPageOrDropdown>;
}

/**
 * A named, ordered collection of items, keyed by their nav display name.
 *
 * The keys of `data` are the nav display names, e.g. "Extractions".
 */
export interface INavCollection<TItem> {
  /**
   * Items keyed by their nav display name
   */
  data: Record<string, TItem>;
  /**
   * Order of items to be displayed in the navigation
   */
  order: string[];
}

/**
 * A top‑level navigation item can be either a page or a dropdown.
 */
export type TPageOrDropdown = IPage | INavDropdown;

/**
 * The full navigation configuration.
 */
export type TNavConfig = INavCollection<TPageOrDropdown>;

/**
 * A page element can be either a React node or a boardId reference.
 */
export type TPageElement = React.ReactNode | string;

/**
 * A mapping of page element references to their corresponding JSX elements.
 */
export type TPageElements = Record<string, TPageElement>;

/**
 * The brand displayed in the navigation bar, either as a string title or a React node.
 */
export type TNavBrand = string | React.ReactNode;

// @ts-ignore - example documentation
const EXAMPLE: TNavConfig = {
  data: {
    "Dropdown Example 1": {
      access: "public",
      path: {
        route: "dropdown-path",
      },
      pages: {
        data: {
          "Page Example 2": {
            access: "public",
            path: {
              pageElementReference: "el1",
              route: "/page-example",
            },
          },
        },
        order: ["Page Example 2"],
      },
    },
    "Page Example 1": {
      access: "public",
      path: {
        pageElementReference: "el1",
        route: "page-example",
      },
    },
  },
  order: ["Dropdown Example 1", "Page Example 1"],
};