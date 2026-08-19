/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { PAGE_ACCESS } from "src";

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
   * Predefined access levels
   */
  (typeof PAGE_ACCESS)[keyof typeof PAGE_ACCESS] |
  /**
   * Array of roles that can access, e.g. ['lab']
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
  /**
   * Optional list of pages to hide the navigation bar for.
   */
  hideNavFor?: string[];
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

/**
 * Navigation destination details for nav items.
 */
export interface INavDestination {
  /**
   * The URL or route to navigate to.
   */
  destination: string;
  /**
   * The target attribute for links (e.g., "_blank" for new tab).
   */
  target?: string;
}

/**
 * Configuration for mobile navbar.
 */
export interface IMobileNav {
  /**
   * Key value pair of nav item display name and the font awesome icon name (similar to buttons).
   */
  icons: Record<string, string>;
  /**
   * Boolean to enable login on the navbar
   */
  login?: boolean;
  /**
   * Boolean to enable register on the navbar
   */
  register?: boolean;
  /**
   * Boolean to enable profile on the navbar
   */
  profile?: boolean;
}

