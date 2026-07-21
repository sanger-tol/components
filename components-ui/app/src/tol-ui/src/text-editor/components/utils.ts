/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { Editor } from "@tiptap/core";
import type { EditorStateSnapshot } from "@tiptap/react";
import { TEXT_EDITOR_STATE_KEYS, TMenuBarState } from "../..";

/**
 * Builds the text editor menu bar state from a Tiptap editor snapshot.
 *
 * Returns boolean flags describing which formatting options are currently
 * active and which editor commands can be run. If the editor has not been
 * initialised, all menu bar state keys are returned as false.
 *
 * @param ctx - The current Tiptap editor state snapshot.
 * @returns The active and enabled state for each menu bar control.
 */
export function menuBarStateSelector(
  ctx: EditorStateSnapshot<Editor>,
): TMenuBarState {
  const editor: Editor = ctx.editor;

  // If the editor is not initialized, return a default state with all keys set to false
  if (!editor) {
    return Object.fromEntries(
      TEXT_EDITOR_STATE_KEYS.map((key) => [key, false]),
    ) as TMenuBarState;
  }

  return {
    // Text formatting
    isBold: editor.isActive("bold") ?? false,
    canBold: editor.can().chain().focus().toggleBold().run() ?? false,
    isItalic: editor.isActive("italic") ?? false,
    canItalic: editor.can().chain().focus().toggleItalic().run() ?? false,
    isUnderline: editor.isActive("underline") ?? false,
    canUnderline: editor.can().chain().focus().toggleUnderline().run() ?? false,
    isStrike: editor.isActive("strike") ?? false,
    canStrike: editor.can().chain().focus().toggleStrike().run() ?? false,
    isCode: editor.isActive("code") ?? false,
    canCode: editor.can().chain().focus().toggleCode().run() ?? false,
    isHighlight: editor.isActive("highlight") ?? false,
    canHighlight: editor.can().chain().focus().toggleHighlight().run() ?? false,
    isSuperscript: editor.isActive("superscript") ?? false,
    canSuperscript:
      editor.can().chain().focus().toggleSuperscript().run() ?? false,
    isSubscript: editor.isActive("subscript") ?? false,
    canSubscript: editor.can().chain().focus().toggleSubscript().run() ?? false,

    // Block types
    isParagraph: editor.isActive("paragraph") ?? false,
    canParagraph: editor.can().chain().focus().setParagraph().run() ?? false,
    isHeading1: editor.isActive("heading", { level: 1 }) ?? false,
    canHeading1:
      editor.can().chain().focus().toggleHeading({ level: 1 }).run() ?? false,
    isHeading2: editor.isActive("heading", { level: 2 }) ?? false,
    canHeading2:
      editor.can().chain().focus().toggleHeading({ level: 2 }).run() ?? false,
    isHeading3: editor.isActive("heading", { level: 3 }) ?? false,
    canHeading3:
      editor.can().chain().focus().toggleHeading({ level: 3 }).run() ?? false,
    isHeading4: editor.isActive("heading", { level: 4 }) ?? false,
    canHeading4:
      editor.can().chain().focus().toggleHeading({ level: 4 }).run() ?? false,
    isBlockquote: editor.isActive("blockquote") ?? false,
    canBlockquote:
      editor.can().chain().focus().toggleBlockquote().run() ?? false,
    isCodeBlock: editor.isActive("codeBlock") ?? false,
    canCodeBlock: editor.can().chain().focus().toggleCodeBlock().run() ?? false,

    // Lists
    isBulletList: editor.isActive("bulletList") ?? false,
    canBulletList:
      editor.can().chain().focus().toggleBulletList().run() ?? false,
    isOrderedList: editor.isActive("orderedList") ?? false,
    canOrderedList:
      editor.can().chain().focus().toggleOrderedList().run() ?? false,

    // Alignment
    isAlignLeft: editor.isActive({ textAlign: "left" }) ?? false,
    canAlignLeft:
      editor.can().chain().focus().setTextAlign("left").run() ?? false,
    isAlignCenter: editor.isActive({ textAlign: "center" }) ?? false,
    canAlignCenter:
      editor.can().chain().focus().setTextAlign("center").run() ?? false,
    isAlignRight: editor.isActive({ textAlign: "right" }) ?? false,
    canAlignRight:
      editor.can().chain().focus().setTextAlign("right").run() ?? false,
    isAlignJustify: editor.isActive({ textAlign: "justify" }) ?? false,
    canAlignJustify:
      editor.can().chain().focus().setTextAlign("justify").run() ?? false,

    // Links
    isLink: editor.isActive("link") ?? false,
    canLink:
      editor
        .can()
        .chain()
        .focus()
        .toggleLink({ href: "https://example.com" }) // This is a placeholder; the actual href will be set when the user adds a link
        .run() ?? false,

    // History
    canUndo: editor.can().chain().focus().undo().run() ?? false,
    canRedo: editor.can().chain().focus().redo().run() ?? false,
  };
}
