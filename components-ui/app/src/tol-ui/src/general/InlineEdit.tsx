/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { InlineEdit as RSInlineEdit } from "rsuite";
import { Toaster, Message } from "..";

export interface PInlineEdit {
  text: string;
  editable?: boolean;
  onSave?: (value: string) => void;
  onChange?: (value: string) => void;
  size?: "sm" | "md";
}

export function InlineEdit({
  text,
  onSave,
  onChange,
  editable,
  size = "md",
}: PInlineEdit) {
  const [editedText, setEditedText] = useState(text);
  const [prevText, setPrevText] = useState(text);
  const [errorMessage, setErrorMessage] = useState("");

  const toaster = Toaster();

  // Handles the save action
  const handleSave = () => {
    if (editedText.trim() === "") {
      toaster.push(toastMessage, {
        placement: "topCenter",
        duration: 5000,
      });
      setEditedText(prevText);
      return;
    }

    onSave?.(editedText);
  };

  const toastMessage = (
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
        showControls={false}
        className={`tol-inline-edit-${size}`}
        value={editedText}
        disabled={!editable}
        onChange={(newValue) => {
          errorMessage && setErrorMessage("");
          setEditedText(newValue);
          onChange?.(newValue);
        }}
        onSave={handleSave}
        onEdit={() => setPrevText(editedText)} // Store title before edit
        onCancel={() => setEditedText(prevText)} // Revert to previous title
      />
    </div>
  );
}
