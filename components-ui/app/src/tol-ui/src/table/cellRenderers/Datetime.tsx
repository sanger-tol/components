/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { format } from "date-fns";
import {
  CellTooltip,
  PCell
} from "../..";


export function Datetime(props: PCell) {
  const { value } = props;

  //const dateValue = Array.isArray(value) ? value[0] : value;
  const date = new Date(value!);
  if (isNaN(date.getTime())) return null;
  
  const dateText = format(date, "dd/MM/yyyy");
  const dateContents = format(date, "dd/MM/yyyy HH:mm");
  return <CellTooltip followCursor value={dateText} contents={dateContents} />;
}
