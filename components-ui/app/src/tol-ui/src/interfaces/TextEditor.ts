/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { Editor } from "@tiptap/core";
import type { ReactElement } from "react";
import type { TEXT_EDITOR_STATE_KEYS, PButton } from "..";

export type TTextEditorCustomButton =
  | PButton
  | ReactElement
  | ((editor: Editor) => PButton | ReactElement);

export type TTextEditorButton =
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "code"
  | "highlight"
  | "super_script"
  | "sub_script"
  | "paragraph"
  | "heading_1"
  | "heading_2"
  | "heading_3"
  | "heading_4"
  | "block_quote"
  | "code_block"
  | "bullet_list"
  | "ordered_list"
  | "align_left"
  | "align_center"
  | "align_right"
  | "align_justify"
  | "link"
  | "undo"
  | "redo";

export type TTextEditorButtons = TTextEditorButton[];

export type TMenuBarState = Record<
  (typeof TEXT_EDITOR_STATE_KEYS)[number],
  boolean
>;

export interface ITextEditorButtons {
  /**
   * The Tiptap editor instance.
   */
  editor: Editor | null;
  /**
   * The editor state, which is derived from the editor instance.
   */
  editorState: TMenuBarState;
}
