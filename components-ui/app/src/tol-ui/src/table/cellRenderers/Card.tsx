/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { EColour, Markdown, PCellDisplay, Tag } from "../..";

export interface PCard extends PCellDisplay {
  content: string;
  successBackground: boolean;
  warningBackground: boolean;
  errorBackground: boolean;
}

export function Card(props: PCard) {
  const {
    content,
    successBackground = false,
    warningBackground = false,
    errorBackground = false
  } = props;

  const tagType = successBackground ? (
    EColour.SUCCESS
  ) : warningBackground ? (
    EColour.WARNING
  ) : errorBackground ? (
    EColour.ERROR
  ) : (
    EColour.BACKGROUND
  );

  return (
    <Tag type={tagType}>
      <Markdown
        contents={content}
      />
    </Tag>
  )
}
