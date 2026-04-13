/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  PCellDisplay
} from "../..";


export function Integer(props: PCellDisplay) {
  const { value } = props;

  return (
    <div className="tol-data-point-renderer-integer">
      {value.toLocaleString()}
    </div>
  );
}
