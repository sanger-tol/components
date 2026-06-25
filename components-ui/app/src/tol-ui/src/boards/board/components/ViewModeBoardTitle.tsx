/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export interface PViewModeBoardTitle {
  /**
   * Text to display as the title of the board.
   */
  text: string;
  /**
   * Whether the title is displayed.
   */
  editable: boolean;
}

/**
 * Larger title for a Board. Only shown in view mode.
 * Undefined if editable as the standard editable title component
 * is used instead in edit mode.
 */
export function ViewModeBoardTitle(props: PViewModeBoardTitle) {
  const { editable, text } = props;

  if (editable) return undefined;
  return <h3 key="tol-board-title" data-testid="view-mode-board-title">{text}</h3>;
}
