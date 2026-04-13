/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { format } from "date-fns";
import {
  CellTooltip,
  PCellDisplay
} from "../..";


export function Datetime(props: PCellDisplay) {
  const { value } = props;

  const date = new Date(value!);
  const dateText = format(date, "dd/MM/yyyy");
  const dateContents = format(date, "dd/MM/yyyy HH:mm");

  return (
    <CellTooltip
      followCursor
      value={dateText}
      contents={dateContents}
    />
  );
}
