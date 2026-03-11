/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  PCellDisplay,
  Markdown
} from "../..";


export interface PText extends PCellDisplay {
  text: string;
}

export function Text(props: PText) {
  const { text } = props;

  return <Markdown contents={text} />;
}
