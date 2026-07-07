/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { Editor } from "@tiptap/core";
import type { EditorStateSnapshot } from "@tiptap/react";
import { TEXT_EDITOR_STATE_KEYS, TMenuBarState } from "../..";

export function menuBarStateSelector(
  ctx: EditorStateSnapshot<Editor>,
): TMenuBarState {
  const editor = ctx.editor;

  if (!editor) {
    return {
      ...Object.fromEntries(TEXT_EDITOR_STATE_KEYS.map((key) => [key, false])),
    };
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
        .toggleLink({ href: "https://example.com" })
        .run() ?? false,

    // History
    canUndo: editor.can().chain().focus().undo().run() ?? false,
    canRedo: editor.can().chain().focus().redo().run() ?? false,
  };
}
