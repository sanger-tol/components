/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ISourceTag } from "./interfaces";
import { getSourceColour } from "../table/Utils";
import { normaliseCaps } from "../general/Utils";

function SourceTag(props: ISourceTag) {
  const { source, className } = props;
  const sourceColour = getSourceColour(source);

  return (
    <div
      className={`customise-config-source-no-float ${className}`}
      // @ts-ignore
      style={{
        "--config-source-bg-color": sourceColour,
      }}
    >
      {normaliseCaps(source)}
    </div>
  );
}

export default SourceTag;
