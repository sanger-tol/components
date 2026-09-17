/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { PIconLinkText } from "./IconLinkText";
import { IconLinkText } from "./IconLinkText";

export interface PIconLinkTexts {
  /** Icon links to display. */
  data: PIconLinkText[];
  /** Additional CSS class names applied to the viewer. */
  className?: string;
}

/**
 * @autodoc
 *
 * Renders a vertical list of icon links with optional text labels, detecting missing values from
 * known provider URLs.
 */
export function IconLinkTexts(props: PIconLinkTexts) {
  const { data, className } = props;
  return (
    <div className={`tol-icon-link-texts-viewer${className ? ` ${className}` : ""}`}>
      {data.map((item, index) => (
        <IconLinkText key={index} {...item} />
      ))}
    </div>
  );
}