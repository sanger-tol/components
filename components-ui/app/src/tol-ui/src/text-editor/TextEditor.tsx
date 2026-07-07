/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useMemo, useState } from "react";
import {
  useEditor,
  EditorContent,
  EditorContext,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import TextAlign from "@tiptap/extension-text-align";
import { Modal, MenuBar } from "..";
import type {
  TTextEditorButtons,
  TTextEditorCustomButton,
} from "..";
import {
  ReferenceExtension,
  TextEditorReference,
} from "./ReferenceExtension";

export interface PTextEditor {
  menuButtons: TTextEditorButtons;
  /** References available in the `~` picker; rendered as chips, serialised as `[~ref:<id>]` */
  references?: TextEditorReference[];
  /** Extra toolbar buttons; pass a function to access the editor instance */
  customButtons?: TTextEditorCustomButton[];
  keyboardShortcutElement?: React.ReactNode;
}

const testReferences: TextEditorReference[] = [
  {
    id: "ref1",
    title: "Reference 1",
    url: "https://example.com/reference1",
  },
  {
    id: "ref2",
    title: "Reference 2",
    url: "https://example.com/reference2",
  },
];

export const ReferencesModal = ({ refModal, setRefModal }) => {
  const [displayMode, setDisplayMode] = useState<"add" | "edit">("add");

  useEffect(() => {
    if (refModal) setDisplayMode(refModal.mode);
  }, [refModal]);

  const title = displayMode === "add" ? "Add New Reference" : "Edit Reference";

  return (
    <Modal
      header={<h3>{title}</h3>}
      open={refModal !== null}
      setOpen={() => setRefModal(null)}
      size="sm"
    />
  );
};

export function TextEditor(props: PTextEditor) {
  const {
    menuButtons,
    references = testReferences,
    customButtons,
    keyboardShortcutElement,
  } = props;

  const [refModal, setRefModal] = useState<
    | { mode: "add"; query?: string }
    | { mode: "edit"; reference: TextEditorReference }
    | null
  >(null);

  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        Highlight,
        Superscript,
        Subscript,
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        ReferenceExtension(references, {
          onCreateReference: () => {
            setRefModal({ mode: "add" });
          },
          onEditReference: (reference) => {
            setRefModal({ mode: "edit", reference });
          },
        }),
      ],
      content: "<p>Hello World!</p>",
      editorProps: {
        attributes: {
          class: "tol-text-editor__content",
        },
        handleClickOn: (_view: any, _pos: any, node: any) => {
          if (node.type.name === "reference" && node.attrs.url) {
            window.open(node.attrs.url, "_blank", "noopener,noreferrer");
            return true;
          }
          return false;
        },
      },
    },
    [references],
  );

  const providerValue = useMemo(() => ({ editor }), [editor]);

  return (
    <EditorContext.Provider value={providerValue}>
      <ReferencesModal refModal={refModal} setRefModal={setRefModal} />
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
