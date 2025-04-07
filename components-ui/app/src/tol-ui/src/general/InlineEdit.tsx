/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { InlineEdit as RSInlineEdit } from "rsuite";
import { Toaster, Message } from "../index";
import { IInlineEdit } from "../models";

function InlineEdit({ title, onSave, onChange, editable }: IInlineEdit) {
  const [editedTitle, setEditedTitle] = useState(title);
  const [prevTitle, setPrevTitle] = useState(title);
  const [errorMessage, setErrorMessage] = useState("");

  const toaster = Toaster();
  const toastMessage = (
    <Message
      children="Title cannot be blank."
      type="error"
      showIcon={true}
      closable
      styles={{ marginTop: "5px" }}
    />
  );

  // Handles the save action
  const handleSave = () => {
    if (editedTitle.trim() === "") {
      toaster.push(toastMessage, {
        placement: "topCenter",
        duration: 5000,
      });
      setEditedTitle(prevTitle);
      return;
    }

    onSave?.(editedTitle);
  };

  return (
    <div>
      <RSInlineEdit
        showControls={false}
        className="inline-edit"
        value={editedTitle}
        disabled={!editable}
        onChange={(newValue) => {
          errorMessage && setErrorMessage("");
          setEditedTitle(newValue);
          onChange?.(newValue);
        }}
        onSave={handleSave}
        onEdit={() => setPrevTitle(editedTitle)} // Store title before edit
        onCancel={() => setEditedTitle(prevTitle)} // Revert to previous title
      />
    </div>
  );
}

export default InlineEdit;
