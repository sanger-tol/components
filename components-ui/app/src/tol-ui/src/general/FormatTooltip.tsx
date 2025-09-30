/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { updateContents } from "..";

export interface PFormatTooltip {
  contents: object;
}

export function FormatTooltip(props: PFormatTooltip) {
  const { contents } = props;

  return (
    <div className="tooltip-contents">
      {Object.entries(updateContents(contents)).map(([key, value]) => {

        // deal with lists
        if (Array.isArray(value)) {
          value = value.map((item, index) => (
            <span key={index}>
              {`${item}${index < value.length - 1 ? ',' : ''}  `}
            </span>
          ));
        }

        return (
          <div className="formatted-tooltip" key={key}>
            <span className="tooltip-key">{key}:</span>
            <span className="tooltip-value">{value}</span>
          </div>
        );
      })}
    </div>
  );
}
