/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { getSourceColour } from "../table/utils";
import { normaliseCaps } from "./utils";

interface Props {
  className?: string;
  source: string;
}

export function SourceTag(props: Props) {
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
