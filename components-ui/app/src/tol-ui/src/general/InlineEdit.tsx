/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { InlineEdit as RSInlineEdit } from "rsuite";
import { Toaster, Message } from "..";

export interface PInlineEdit {
  text?: string;
  editable?: boolean;
  onSave?: (value: string) => void;
  onChange?: (value: string) => void;
  size?: "sm" | "md";
}

export function InlineEdit(props: PInlineEdit) {
  const { text, editable } = props;
  const [editedText, setEditedText] = useState(text);
  const [prevText, setPrevText] = useState(text);
  const [errorMessage, setErrorMessage] = useState("");

  const toaster = Toaster();

  // Handles the save action
  const onSave = () => {
    // Account for possible undefined
    if (!editedText) return;

    if (editedText.trim() === "") {
      toaster.push(ToastMessage, {
        placement: "topCenter",
        duration: 5000,
      });
      setEditedText(prevText);
      return;
    }

    props.onSave?.(editedText);
  };

  const onChange = (newValue: any) => {
    errorMessage && setErrorMessage("");
    setEditedText(newValue);
    props.onChange?.(newValue);
  }


  const ToastMessage = (
    <Message
      children="Title cannot be blank."
      type="error"
      showIcon={true}
      closable
      styles={{ marginTop: "5px" }}
    />
  );

  return (
    <div>
      <RSInlineEdit
        className="tol-inline-edit"
        value={editedText}
        disabled={!editable}
        onChange={onChange}
        onSave={onSave}
        onEdit={() => setPrevText(editedText)} // Store title before edit
        onCancel={() => setEditedText(prevText)} // Revert to previous title
      />
    </div>
  );
}
