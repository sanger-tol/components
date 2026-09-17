/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode } from "react";
import { Icon } from "../general";
import { detectLinkDetails } from "./utils";

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
 * Renders an icon inside a link, detecting the icon and style from known provider URLs when
 * they are omitted.
 */
export function IconLink(props: PIconLink & { children?: ReactNode }) {
  const {
    link,
    icon: providedIcon,
    config: providedConfig,
    size = "2x",
    className,
    children,
  } = props;
  const detectedDetails = detectLinkDetails(link);
  const icon = providedIcon ?? detectedDetails.icon;
  const config = providedConfig ?? detectedDetails.config ?? "solid";

  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      className={`icon tol-icon-link-text${className ? ` ${className}` : ""}`}
    >
      {icon && <Icon icon={icon} config={config} size={size} />}
      {children}
    </a>
  );
}
