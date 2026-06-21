/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { COLOURS, Markdown, Tag } from "../..";
import type { PCellDisplay } from "../..";

export interface PCard extends PCellDisplay {
  /**
   * Markdown Parameter: The unformatted markdown to display in the cell.
   * By this stage, inserted attribute data (from the '${}' syntax) has already been added.
   */
  content: string;
  /**
   * Condition Parameter: Whether the success background colour should be used
   */
  successBackground: boolean;
  /**
   * Condition Parameter: Whether the warning background colour should be used
   */
  warningBackground: boolean;
  /**
   * Condition Parameter: Whether the error background colour should be used
   */
  errorBackground: boolean;
}

/**
 * Cell renderer that displays markdown content in a rectangular container,
 * with a background indicating the status of the content.
 */
export function Card(props: PCard) {
  const {
    content,
    successBackground = false,
    warningBackground = false,
    errorBackground = false
  } = props;

  const tagType = successBackground ? (
    COLOURS.SUCCESS
  ) : warningBackground ? (
    COLOURS.WARNING
  ) : errorBackground ? (
    COLOURS.DANGER
  ) : (
    COLOURS.GREY
  );

  return (
    <Tag type={tagType} className="tol-table-card-cell">
      <Markdown
        contents={content}
      />
    </Tag>
  )
}
