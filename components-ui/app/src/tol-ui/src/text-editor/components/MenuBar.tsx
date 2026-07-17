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
  ITextEditorButtons,
} from "../..";

export interface PMenuBar {
  /**
   * The Tiptap editor instance. The menu bar will not render until this is available.
   */
  editor: Editor | null;
  /**
   * An optional array of button names to display in the menu bar.
   */
  buttons?: TTextEditorButtons;
  /**
   * An optional array of custom button definitions or factories to render in the menu bar.
   * Custom buttons will be rendered before the undo and redo buttons.
   */
  customButtons?: TTextEditorCustomButton[];
}

/**
 * @autodoc
 *
 * Renders the formatting toolbar for a Tiptap text editor. It derives the state
 * of standard controls from the active editor, optionally filters them with
 * `buttons`, and renders custom controls before the undo and redo actions.
 *
 * The toolbar is not rendered until the editor instance and its state are ready.
 */
export function MenuBar(props: PMenuBar) {
  const { editor, buttons, customButtons } = props;

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
    { editor, editorState } as ITextEditorButtons,
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
            return (
              <Fragment key={buttonProps.key ?? index}>{buttonProps}</Fragment>
            );
          }

          const { key: buttonKey, ...buttonPropsWithoutKey } =
            buttonProps as PButton & {
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
