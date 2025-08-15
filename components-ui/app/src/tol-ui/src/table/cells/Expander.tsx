/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import {
  CellTooltip,
  PCell
} from "../..";


export function Expander(props: PCell) {
  const { value } = props;

  const shortValue = (
    <div className="copy-icon">
      {value.substring(0, 32) + "..."}
      <FontAwesomeIcon
        icon={faCopy}
        size="sm"
        onClick={() => {
          navigator.clipboard.writeText(value);
        }}
      />
    </div>
  );

  return <CellTooltip value={shortValue} contents={value} />;
}
