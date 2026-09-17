/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode } from "react";
import { Icon } from ".";
import { KNOWN_ICON_PROVIDERS } from "../constants";


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
 * Checks whether a URL matches one of the known social/provider link patterns.
 *
 * @param link - The URL or link target to inspect.
 * @returns True when the URL includes a known provider name such as GitHub or GitLab.
 */
export function isKnownIconLink(link: string): boolean {
  return Object.keys(KNOWN_ICON_PROVIDERS).some((name) =>
    link.toLowerCase().includes(name)
  );
}

/**
 * Extracts the matching provider metadata for a known link URL.
 *
 * @param link - The URL or link target to inspect.
 * @returns The icon name, visible text, and style configuration for the detected provider,
 * or an empty object when the URL does not match a known provider.
 */
export function detectLinkDetails(link: string): IDetectedLinkDetails {
  const provider = Object.keys(KNOWN_ICON_PROVIDERS).find((name) =>
    link.toLowerCase().includes(name)
  );

  return provider
    ? {
        icon: KNOWN_ICON_PROVIDERS[provider].icon,
        text: KNOWN_ICON_PROVIDERS[provider].text,
        config: KNOWN_ICON_PROVIDERS[provider].config ?? "brands",
      }
    : {};
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
