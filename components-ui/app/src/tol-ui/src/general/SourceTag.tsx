/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { getSourceColour } from "../table/Utils";
import { normaliseCaps } from "./Utils";

export interface ISourceTag {
  className?: string;
  source: string;
}

function SourceTag(props: ISourceTag) {
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

export default SourceTag;
