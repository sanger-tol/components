/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useMemo, useRef } from "react";
import { useEditor, EditorContent, EditorContext } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import TextAlign from "@tiptap/extension-text-align";
import { DEFAULT_TEXT_EDITOR_BUTTONS, MenuBar } from "..";
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
   * If not provided, a basic set will be shown.
   * The order of buttons in the array determines their order in the toolbar.
   * Valid button names are defined in the TTextEditorButton type.
   * See the TTextEditorButton type for a list of valid button names.
   */
  menuButtons?: TTextEditorButtons;
  /**
   * An optional string to specify the format of the value returned by the text editor.
   * - "html": The value will be returned as an HTML string.
   * - "json": The value will be returned as a JSON string representing the editor's document structure.
   * - "text": The value will be returned as plain text, stripping all formatting.
   */
  returnValueType?: "html" | "json" | "text";
  /**
   * An optional list of custom extensions to add to the Tiptap editor.
   * Custom extensions can be used to add new formatting options or functionality.
   *
   * IMPORTANT: this array must be referentially stable (e.g. a module-level
   * constant or wrapped in useMemo). Passing a new array or extension instance
   * on every render rebuilds the editor, losing focus and selection.
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
  /**
   * An optional callback function that is called whenever the editor instance changes.
   * Gives consumers access to the editor instance for advanced use cases,
   * such as programmatically triggering actions or accessing the editor's state.
   */
  onEditorChange?: (editor: any) => void;
  /**
   * An optional string or number to specify the height of the text editor.
   */
  height?: string | number;
}

/**
 * @autodoc
 *
 * Renders a Tiptap-powered rich text editor with a configurable formatting toolbar.
 * The editor initializes from `value` and calls `setValue` whenever its content changes,
 * serializing that content as HTML, JSON, or plain text according to `returnValueType`.
 *
 * Consumers can extend the editor, add toolbar controls, control its editability and height,
 * and access the current editor instance through `onEditorChange` or `EditorContext`.
 */
export function TextEditor(props: PTextEditor) {
  const {
    value,
    setValue,
    menuButtons = DEFAULT_TEXT_EDITOR_BUTTONS,
    customButtons,
    returnValueType = "json",
    keyboardShortcutElement,
    customExtensions,
    editable = true,
    onEditorChange,
    height,
  } = props;

  // Memoize the extensions array to avoid unnecessary editor rebuilds.
  // Relies on customExtensions being referentially stable (see prop docs).
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
        if (returnValueType === "html" || returnValueType === undefined) {
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
    [extensions],
  );

  // Apply editable changes in place instead of rebuilding the editor
  useEffect(() => {
    if (editor && editor.isEditable !== editable) {
      editor.setEditable(editable);
    }
  }, [editor, editable]);

  const onEditorChangeRef = useRef(onEditorChange);
  onEditorChangeRef.current = onEditorChange;

  // Share the editor instance with the consumer only when it actually changes
  useEffect(() => {
    if (editor) {
      onEditorChangeRef.current?.(editor);
    }
  }, [editor]);

  // Memoize the provider value to avoid unnecessary re-renders of the context provider
  const providerValue = useMemo(() => ({ editor }), [editor]);

  return (
    <EditorContext.Provider value={providerValue}>
      <div
        className="tol-text-editor"
        style={height ? { height: height } : undefined}
      >
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
