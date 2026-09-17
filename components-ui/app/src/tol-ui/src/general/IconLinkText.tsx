/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { IconLink, PIconLink, detectLinkDetails } from "./IconLink";

export interface PIconLinkText extends PIconLink {
  /** Text displayed beside the icon; detected from the URL when omitted. */
  text?: string;
}

/**
 * @autodoc
 *
 * Renders an icon link with a text label, detecting both values from known provider URLs when
 * they are omitted.
 */
export function IconLinkText(props: PIconLinkText) {
  const { link, text: providedText, ...linkProps } = props;
  const detectedDetails = detectLinkDetails(link);
  const text = providedText ?? detectedDetails.text;
  return <IconLink link={link} {...linkProps}>{text}</IconLink>;
}
