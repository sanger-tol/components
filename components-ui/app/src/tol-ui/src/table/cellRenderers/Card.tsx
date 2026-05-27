/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Markdown } from "../..";

export interface PCard extends PCellDisplay {
  content: string;
  successBackground: boolean;
  warningBackground: boolean;
  errorBackground: boolean;
}

export function Card(props: PCard) {
  const {
    content,
    successBackground,
    warningBackground,
    errorBackground
  } = props;

  return (
    <Markdown
      contents={content}
    />
  )
}
