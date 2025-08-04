/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { updateContents } from "..";

interface PFormatTooltip {
  contents: object;
}

export function FormatTooltip(props: PFormatTooltip) {
  return (
    <div className="tooltip-contents">
      {Object.entries(updateContents(props.contents)).map(([key, value]) => (
        <div className="formatted-tooltip" key={key}>
          <span className="tooltip-key">{key}:</span>
          <span className="tooltip-value">{value}</span>
        </div>
      ))}
    </div>
  );
}
