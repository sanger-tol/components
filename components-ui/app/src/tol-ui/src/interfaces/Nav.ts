/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { PAGE_ACCESS } from "..";

/** Query parameters for a navigation page, including nested filter values. */
export type TQueryParams = Record<string, unknown>;

/** Converters applied to every route parameter used in query placeholders. */
export type TParamConverters = string[];

/** A navigation destination represented by an internal page or external link. */
export type TPagePath = IPageElement | IPageLink;

/** Configuration for an internal navigation page. */
export interface IPageElement {
  /** Reference to a specific page element or board ID; optional for dropdowns. */
  pageElementReference?: string;
  /** Route path within the app; defaults to the navigation item name when omitted. */
  route?: string;
  /** Query parameters for the page, represented as a key-value object. */
  queryParams?: TQueryParams;
  /** Optional converters applied to all route parameters in query placeholders. */
  paramConverters?: TParamConverters;
}

/** Configuration for an external navigation link. */
export interface IPageLink {
  /** External link URL. */
  href: string;
  /** Target browsing context, such as `_blank` for a new tab. */
  target?: string;
}

/** Access level or role list required to view a navigation item. */
export type TPageAccess =
  (typeof PAGE_ACCESS)[keyof typeof PAGE_ACCESS] |
  string[];

/** Base configuration shared by navigation pages and dropdowns. */
export interface IPage {
  /** Access level required to view the page. */
  access: TPageAccess;
  /** Route or external link for the page. */
  path?: TPagePath;
  /** Optional icon, such as a Font Awesome class name. */
  icon?: string;
}

/** A dropdown containing a collection of pages. */
export interface INavDropdown extends IPage {
  /** Pages within the dropdown, keyed by navigation display name. */
  pages: INavCollection<TPageOrDropdown>;
}

/** A named, ordered collection of navigation items keyed by display name. */
export interface INavCollection<TItem> {
  /** Items keyed by navigation display name. */
  data: Record<string, TItem>;
  /** Order in which items are displayed in the navigation. */
  order: string[];
  /** Optional list of routes for which the navigation bar is hidden. */
  hideNavFor?: string[];
}

/** A top-level navigation item can be either a page or a dropdown. */
export type TPageOrDropdown = IPage | INavDropdown;

/** The full navigation configuration. */
export type TNavConfig = INavCollection<TPageOrDropdown>;

/** A page element can be either a React node or a board ID reference. */
export type TPageElement = React.ReactNode | string;

/** Mapping of page element references to their corresponding JSX elements. */
export type TPageElements = Record<string, TPageElement>;

/** Brand displayed in the navigation bar as a string title or React node. */
export type TNavBrand = string | React.ReactNode;

/** Resolved navigation destination details. */
export interface INavDestination {
  /** URL or route to navigate to. */
  destination: string;
  /** Target attribute for links, such as `_blank` for a new tab. */
  target?: string;
}

/** Configuration for the mobile navigation bar. */
export interface IMobileOptions {
  /** Enables mobile-first navigation. */
  enabled: boolean;
  /** Enables the login action in the navigation bar. */
  login?: boolean;
  /** Enables the registration action in the navigation bar. */
  register?: boolean;
  /** Enables the profile action in the navigation bar. */
  profile?: boolean;
}

