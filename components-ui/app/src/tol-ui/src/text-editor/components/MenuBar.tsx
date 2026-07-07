/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import { menuBarStateSelector, TEXT_EDITOR_BUTTONS, Button, toggleReferencePicker } from "../..";
import type {
  TTextEditorButtons,
  TTextEditorCustomButton,
  TTextEditorButton,
} from "../..";

export function MenuBar({
  editor,
  buttons,
  customButtons,
}: {
  editor: Editor | null;
  buttons?: TTextEditorButtons;
  customButtons?: TTextEditorCustomButton[];
}) {
  const editorState = useEditorState({
    editor,
    selector: menuBarStateSelector ?? null,
  });

  if (!editor) {
    return null;
  }

  const { UNDO, REDO, ...toolbarButtons } = TEXT_EDITOR_BUTTONS(
    { editor },
    editorState,
  );

  const visibleButtons = Object.entries(toolbarButtons).filter(
    ([key]) =>
      !buttons || buttons.includes(key.toLowerCase() as TTextEditorButton),
  );

  return (
    <div className="tol-text-editor__toolbar">
      <div className="tol-text-editor__toolbar-group">
        {visibleButtons.map(([key, button]) => (
          <Button key={key} {...button} />
        ))}
      </div>
      <div className="tol-text-editor__toolbar-group tol-text-editor__toolbar-group--end">
        <Button
          icon="book-bookmark"
          tooltip="Insert reference at cursor"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => toggleReferencePicker(editor)}
        />
        {customButtons?.map((customButton, index) => {
          const buttonProps =
            typeof customButton === "function"
              ? customButton(editor)
              : customButton;
          return <Button key={buttonProps.id ?? index} {...buttonProps} />;
        })}
        <Button {...UNDO} />
        <Button {...REDO} />
      </div>
    </div>
  );
}
