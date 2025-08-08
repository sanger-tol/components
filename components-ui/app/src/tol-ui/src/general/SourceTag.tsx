/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { normaliseCaps, getSourceColour } from "..";

export interface PSourceTag {
  className?: string;
  source: string;
}

export function SourceTag(props: PSourceTag) {
  const { source, className } = props;
  const sourceColour = getSourceColour(source);

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
