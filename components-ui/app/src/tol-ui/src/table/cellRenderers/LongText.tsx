/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import {
  CellTooltip,
  copyToClipboard,
  PCell
} from "../..";


export function LongText(props: PCell) {
  const { value } = props;
  const CHAR_LIMIT = 32;

  const ShortValue = (
    <div className="copy-icon">
      {value.length > CHAR_LIMIT ? value.substring(0, CHAR_LIMIT) + "..." : value}
      <FontAwesomeIcon
        icon={faCopy}
        size="sm"
        onClick={() => {
          copyToClipboard(value);
        }}
      />
    </div>
  );

  return <CellTooltip value={ShortValue} contents={value} />;
}
