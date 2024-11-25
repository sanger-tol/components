/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from 'react';
import { InlineEdit } from 'rsuite';
import { Toaster, Message } from '../index';

interface Props {
  title: string;
  size?: 'sm' | 'md' | 'lg'; //small | medium | large; default = medium
  onSave?: (value: string) => void; 
  onChange?: (value: string) => void; 
}

function EditableTitle({ title, size = 'md', onSave, onChange }: Props) {
  const [editedTitle, setEditedTitle] = useState(title);
  const [prevTitle, setPrevTitle] = useState(title);
  const [errorMessage, setErrorMessage] = useState('');

  const maxLength = 64; //max title characters
  const warningThreshold = 10;
  const remainingCharacters = maxLength - editedTitle.length;

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
    if (editedTitle.trim() === '') {
      toaster.push(
        toastMessage, { 
          placement: "topCenter", 
          duration: 5000 }
        )
      setEditedTitle(prevTitle); 
      return; 
    }

    onSave?.(editedTitle);
  };

  return (
    <div className={`title-size-${size}`}>
      <InlineEdit
        value={editedTitle}
        onChange={(newValue) => {
          errorMessage && setErrorMessage(''); 

          setEditedTitle(newValue);
          onChange?.(newValue);
        }}
        onSave={handleSave}
        onEdit={() => setPrevTitle(editedTitle)} // Store title before edit
        onCancel={() => setEditedTitle(prevTitle)} // Revert to previous title
        showControls
        className="editable-title"
      >
        {(props, ref) => {
          const { value, plaintext, ...rest } = props;

          return plaintext ? (
            <span className="editable-title-read-mode">
              {value}
            </span>
          ) : (
            <>
              <textarea
                {...rest}
                ref={ref}
                value={value}
                maxLength={maxLength}
                rows={1}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="editable-title-text-area"
              />
              {/* Show character counter only in edit mode */}
              {remainingCharacters <= warningThreshold && (
                <div className={`character-counter ${remainingCharacters < 0 ? 'warning' : ''}`}>
                  {remainingCharacters} characters remaining
                </div>
              )}
            </>
          );
        }}
      </InlineEdit>
    </div>
  );
}

export default EditableTitle;

