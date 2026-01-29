/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { InlineEdit as RSInlineEdit } from "rsuite";

export interface PEditableTitle {
  text?: string;
  editable?: boolean;
  onSave?: (value: string) => void;
  onChange?: (value: string) => void;
}

export function EditableTitle(props: PEditableTitle) {
  const { text, editable } = props;
  const [editedText, setEditedText] = useState(text);
  const [prevText, setPrevText] = useState(text);
  const [errorMessage, setErrorMessage] = useState("");

  // Handles the save action
  const onSave = () => {
    // Account for possible undefined
    if (!editedText) return;

    props.onSave?.(editedText);
  };

  const onChange = (newValue: any) => {
    errorMessage && setErrorMessage("");
    setEditedText(newValue);
    props.onChange?.(newValue);
  }

  return (
    <RSInlineEdit
      className="tol-editable-title"
      value={editedText}
      disabled={!editable}
      onChange={onChange}
      onSave={onSave}
      onEdit={() => setPrevText(editedText)} // Store title before edit
      onCancel={() => setEditedText(prevText)} // Revert to previous title
    />
  );
}
