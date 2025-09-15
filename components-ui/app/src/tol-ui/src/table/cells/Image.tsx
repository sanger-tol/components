/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  PCell
} from "../..";


export function Image(props: PCell) {
  const { value } = props;

  return (
    <a href={value} target="_blank" rel="noopener noreferrer">
      <img src={value} alt={value} width="30%" />
    </a>
  );
}
