/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { TTextEditorButtons } from "src/interfaces";

export const TEXT_EDITOR_STATE_KEYS = [
  "isBold",
  "canBold",
  "isItalic",
  "canItalic",
  "isUnderline",
  "canUnderline",
  "isStrike",
  "canStrike",
  "isCode",
  "canCode",
  "isHighlight",
  "canHighlight",
  "isSuperscript",
  "canSuperscript",
  "isSubscript",
  "canSubscript",
  "isParagraph",
  "canParagraph",
  "isHeading1",
  "canHeading1",
  "isHeading2",
  "canHeading2",
  "isHeading3",
  "canHeading3",
  "isHeading4",
  "canHeading4",
  "isBlockquote",
  "canBlockquote",
  "isCodeBlock",
  "canCodeBlock",
  "isBulletList",
  "canBulletList",
  "isOrderedList",
  "canOrderedList",
  "isAlignLeft",
  "canAlignLeft",
  "isAlignCenter",
  "canAlignCenter",
  "isAlignRight",
  "canAlignRight",
  "isAlignJustify",
  "canAlignJustify",
  "isLink",
  "canLink",
  "canUndo",
  "canRedo",
] as const;

export const DEFAULT_TEXT_EDITOR_BUTTONS = [
  "bold",
  "italic",
  "underline",
  "bullet_list",
  "ordered_list",
] as TTextEditorButtons;
