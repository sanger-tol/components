/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { InlineEdit as RSInlineEdit } from "rsuite";

export interface PEditableTitle {
  /**
   * The text to be displayed as the title. This will be used as the initial value for the editable title.
   */
  text?: string;
  /**
   * Whether the title is editable. If false, the title will be displayed as plain text.
   */
  editable?: boolean;
  /**
   * Placeholder to show when the title is empty.
   */
  placeholder?: string;
  /**
   * Callback function that is called when the title is saved. Receives the new title as an argument.
   */
  onSave?: (value: string) => void;
  /**
   * Callback function that is called when the title is changed (on each keystroke). Receives the new title as an argument.
   */
  onChange?: (value: string) => void;
}

export function EditableTitle(props: PEditableTitle) {
  const {
    text = "",
    editable,
    placeholder = "Click to edit...",
  } = props;

  const [editedText, setEditedText] = useState(text);
  const [prevText, setPrevText] = useState(text);

  const onSave = () => {
    const trimmed = editedText.trim();
    setEditedText(trimmed);
    props.onSave?.(trimmed);
  };

  const onChange = (newValue: string) => {
    setEditedText(newValue);
    props.onChange?.(newValue);
  };

  return (
    <RSInlineEdit
      className="tol-editable-title"
      value={editedText}
      disabled={!editable}
      onChange={onChange}
      onSave={onSave}
      onEdit={() => setPrevText(editedText)} // Store title before edit
      onCancel={() => setEditedText(prevText)} // Revert to previous title
      placeholder={placeholder}
    />
  );
}