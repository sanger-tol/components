/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Loader, TNavBrand } from "../index";

export interface PLoadingContent {
  /**
   * The text to display below the loader.
   */
  text?: string;
  /**
   * The brand to display in the loading screen. Either a logo or text using the primary color.
   */
  brand?: TNavBrand;
  /**
   * Additional class name(s) to apply to the loading content container.
   */
  className?: string;
  /**
   * Whether the loading content should overlay the nav and footer.
   */
  overlayNav?: boolean;
};

/**
 * Component to display a loading state with an optional brand and text.
 * Can be used to indicate loading states across the app, such as when fetching board data or applying filters.
 */
export function LoadingContent(props: PLoadingContent) {
  const { text = "Loading...", brand, className, overlayNav = false } = props;

  return (
    <div
      className={
        `tol-fixed-full-page ${className ?? ""} ${overlayNav ? "overlay-nav" : ""}`.trim()
      }
    >
      <div className="fixed-centered-brand navbar-brand">{brand}</div>
      <div className="fixed-centered-loader"><Loader /></div>
      <div className="fixed-centered-text">{text}</div>
    </div >
  );
}