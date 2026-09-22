/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Icon } from "../general";
import type { PIconLink } from "./IconLink";
import { detectLinkDetails } from "./utils";

/**
 * Props for an icon link that displays a text label.
 *
 * Extends the base icon link props with an optional label, which can be
 * inferred from the link URL when it is not supplied.
 */
export interface PIconLinkText extends PIconLink {
  /** Text displayed beside the icon; detected from the URL when omitted. */
  text?: string;
}

/**
 * @autodoc
 *
 * Renders an icon link with an optional text label, detecting missing icon,
 * style, and text values from known provider URLs.
 */
export function IconLinkText(props: PIconLinkText) {
  const {
    link,
    icon: providedIcon,
    config: providedConfig,
    size = "2x",
    className,
    text: providedText,
  } = props;
  const detectedDetails = detectLinkDetails(link);
  const text = providedText ?? detectedDetails.text;
  const icon = providedIcon ?? detectedDetails.icon;
  const config = providedConfig ?? detectedDetails.config;

  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      className={`icon tol-icon-link-text${className ? ` ${className}` : ""}`}
    >
      {icon && <Icon icon={icon} config={config} size={size} />}
      {text}
    </a>
  );
}
