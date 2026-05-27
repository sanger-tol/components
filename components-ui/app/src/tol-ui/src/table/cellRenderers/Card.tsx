/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Markdown } from "../..";

export interface PCard extends PCellDisplay {
  successBackground: boolean;
  warningBackground: boolean;
  errorBackground: boolean;
  content: string;
}

export function Card(props: PCard) {
  const {
    successBackground,
    warningBackground,
    errorBackground,
    content
  } = props;

  return (
    <Markdown
      contents={content}
    />
  )
}
