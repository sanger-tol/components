/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export interface IBreadcrumbLink {
  /**
   * The text to display for the breadcrumb link.
   */
  text: string;
  /**
   * The URL to navigate to when the breadcrumb link is clicked.
   */
  url?: string;
  /**
   * Function to be called on click.
   */
  onClick?: () => void;
}

export type TBreadcrumbLinks = IBreadcrumbLink[] | "auto";
export type TBreadcrumbSize = "sm" | "md" | "lg";
