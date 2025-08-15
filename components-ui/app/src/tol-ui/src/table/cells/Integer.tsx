/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  PCell
} from "../..";


export function Integer(props: PCell) {
  const { value } = props;

  return (
    <div className="tol-cell-renderer-integer">
      {value.toLocaleString()}
    </div>
  );
}
