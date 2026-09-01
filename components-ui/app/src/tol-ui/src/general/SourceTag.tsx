/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { normaliseCaps, getSourceColour } from "..";

/** Props for rendering a source badge/tag. */
export interface PSourceTag {
  /** Optional additional class names applied to the tag container. */
  className?: string;
  /** Source identifier (for example `sts`) displayed in normalised form. */
  source?: string;
}

/** Renders a colour-coded source tag when a source value is provided. */
export function SourceTag(props: PSourceTag) {
  const { source, className } = props;
  const sourceColour = getSourceColour(source);

  if (source) {
    return (
      <div
        className={`tol-customise-config-source-no-float ${className}`}
        // @ts-ignore
        style={{ "--config-source-bg-color": sourceColour }}
      >
        {normaliseCaps(source)}
      </div>
    );
  }
}
