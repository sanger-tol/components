/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Loader, TNavBrand } from "../index";

export interface PLoadingContent {
  text?: string;
  brand?: TNavBrand;
  className?: string;
  overlayNav?: boolean;
};

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