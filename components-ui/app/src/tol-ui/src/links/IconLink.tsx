/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { IconLinkText } from "./IconLinkText";

/**
 * Props for rendering an icon link to an external provider or resource.
 *
 * When the icon is not supplied, the component can infer it from the URL using
 * known provider metadata.
 */
export interface PIconLink {
  /** URL opened when the link is activated. */
  link: string;
  /** Font Awesome icon name; detected from the URL when omitted. */
  icon?: string;
  /** Font Awesome icon style, such as `solid`, `regular`, or `brands`. */
  config?: string;
  /** Font Awesome icon size. */
  size?: string;
  /** Additional CSS class names applied to the link. */
  className?: string;
}

/**
 * @autodoc
 *
 * Renders an icon link without a text label.
 */
export function IconLink(props: PIconLink) {
  return <IconLinkText {...props} text="" />;
}
