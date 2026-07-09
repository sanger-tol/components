/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useMemo } from "react";
import { useEditor, EditorContent, EditorContext } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import TextAlign from "@tiptap/extension-text-align";
import { MenuBar } from "..";
import type { TTextEditorButtons, TTextEditorCustomButton } from "..";

export interface PTextEditor {
  /**
   * The current content of the text editor as a string.
   */
  value: string;
  /**
   * A function to update the content of the text editor.
   */
  setValue: (value: string) => void;
  /**
   * The list of standard toolbar buttons to display in the text editor.
   * If not provided, all standard buttons will be displayed.
   * The order of buttons in the array determines their order in the toolbar.
   * Valid button names are defined in the TTextEditorButton type.
   * See the TTextEditorButton type for a list of valid button names.
   */
  menuButtons: TTextEditorButtons;
  /**
   * An optional string to specify the format of the value returned by the text editor.
   * - "html": The value will be returned as an HTML string.
   * - "json": The value will be returned as a JSON string representing the editor's document structure.
   * - "text": The value will be returned as plain text, stripping all formatting.
   */
  returnValueType?: "html" | "json" | "text";
  /**
   * An optional list of custom extensions to add to the Tiptap editor.
   * Custom extensions can be used to add new formatting options or functionality
   */
  customExtensions?: any[];
  /**
   * An optional list of custom button definitions or factories to render in the toolbar.
   * Custom buttons will be rendered before the undo and redo buttons.
   * Each custom button can be a PButton object or a function that takes the editor instance
   * and returns a PButton object.
   */
  customButtons?: TTextEditorCustomButton[];
  /**
   * An optional React node to render in the text editor footer,
   * typically used for displaying keyboard shortcuts.
   */
  keyboardShortcutElement?: React.ReactNode;
  /**
   * An optional boolean to control whether the text editor is editable.
   */
  editable?: boolean;
}

export function TextEditor(props: PTextEditor) {
  const {
    value,
    setValue,
    menuButtons,
    customButtons,
    returnValueType = "json",
    keyboardShortcutElement,
    customExtensions,
    editable = true,
  } = props;

  // Memoize the extensions array to avoid unnecessary re-renders
  const extensions = useMemo(
    () => [
      StarterKit,
      Highlight,
      Superscript,
      Subscript,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      ...(customExtensions || []),
    ],
    [customExtensions],
  );

  const editor = useEditor(
    {
      extensions: extensions,
      content: value,
      onUpdate: ({ editor }) => {
        if (returnValueType === "html") {
          setValue(editor.getHTML());
        } else if (returnValueType === "json") {
          setValue(JSON.stringify(editor.getJSON()));
        } else if (returnValueType === "text") {
          setValue(editor.getText());
        }
      },
      editorProps: {
        attributes: {
          class: "tol-text-editor__content",
        },
      },
      editable: editable,
    },
    [extensions, editable],
  );

  // Memoize the provider value to avoid unnecessary re-renders of the context provider
  const providerValue = useMemo(() => ({ editor }), [editor]);

  return (
    <EditorContext.Provider value={providerValue}>
      <div className="tol-text-editor">
        <MenuBar
          editor={editor}
          buttons={menuButtons}
          customButtons={customButtons}
        />
        <EditorContent editor={editor} className="tol-text-editor__body" />
        {keyboardShortcutElement && (
          <div className="tol-text-editor__footer">
            {keyboardShortcutElement}
          </div>
        )}
      </div>
    </EditorContext.Provider>
  );
}
