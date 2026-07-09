/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import { Fragment, isValidElement } from "react";
import { menuBarStateSelector, TEXT_EDITOR_BUTTONS, Button } from "../..";
import type {
  PButton,
  TTextEditorButtons,
  TTextEditorCustomButton,
  TTextEditorButton,
} from "../..";

/**
 * Renders the formatting toolbar for a Tiptap text editor.
 *
            return (
              <Fragment key={buttonProps.key ?? index}>{buttonProps}</Fragment>
            );
 * the optional `buttons` prop, appends custom buttons, and always includes undo
 * and redo controls. Nothing is rendered until an editor instance is available.
          const { key: buttonKey, ...buttonPropsWithoutKey } =
            buttonProps as PButton & {
              key?: string;
            };
 * @param customButtons - Optional custom button definitions or factories to render before undo and redo.
 * @returns The editor toolbar, or null when the editor is not initialised.
 */
export function MenuBar({
  editor,
  buttons,
  customButtons,
}: {
  editor: Editor | null;
  buttons?: TTextEditorButtons;
  customButtons?: TTextEditorCustomButton[];
}) {

  // Use the menuBarStateSelector to get the current state of the editor
  const editorState = useEditorState({
    editor,
    selector: menuBarStateSelector ?? null,
  });

  // If the editor or its state is not initialized, return null to avoid rendering the menu bar
  if (!editor || !editorState) {
    return null;
  }

  // Get the toolbar buttons based on the current editor state
  const { UNDO, REDO, ...toolbarButtons } = TEXT_EDITOR_BUTTONS(
    { editor },
    editorState,
  );

  // Filter the toolbar buttons based on the provided buttons prop
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
        {customButtons?.map((customButton, index) => {
          const buttonProps =
            typeof customButton === "function"
              ? customButton(editor)
              : customButton;

          if (isValidElement(buttonProps)) {
            return <Fragment key={buttonProps.key ?? index}>{buttonProps}</Fragment>;
          }

          const { key: buttonKey, ...buttonPropsWithoutKey } = buttonProps as PButton & {
            key?: string;
          };

          return (
            <Button
              key={buttonKey ?? buttonPropsWithoutKey.id ?? index}
              {...buttonPropsWithoutKey}
            />
          );
        })}
        <Button {...UNDO} />
        <Button {...REDO} />
      </div>
    </div>
  );
}
