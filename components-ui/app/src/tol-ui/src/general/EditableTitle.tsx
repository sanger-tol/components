/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from 'react';
import { InlineEdit } from 'rsuite';
import Message from '../messaging/Message';

interface Props {
  title: string; 
  onSave?: (value: string) => void; 
  onChange?: (value: string) => void; 
}

const EditableTitle: React.FC<Props> = ({ title, onSave, onChange }) => {
  const [editedTitle, setEditedTitle] = useState(title);
  const [prevTitle, setPrevTitle] = useState(title);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSave = () => {
    // Check if the title is blank
    if (editedTitle.trim() === '') {
      setErrorMessage('Title cannot be blank');
      setEditedTitle(prevTitle);
      return; 
    }

    onSave?.(editedTitle);
  };

  return (
    <>
    {errorMessage && (
        <Message
          type="error"
          showIcon={true}
          closable={true}
          onClose={() => setErrorMessage('')} // Close the message on click
        >
          {errorMessage}
        </Message>
      )}
  <InlineEdit
    value={editedTitle}
    onChange={(newValue) => {
      setEditedTitle(newValue);
      onChange?.(newValue);
    }}
    onSave={handleSave}
    onEdit={() => setPrevTitle(editedTitle)}
    onCancel={() => setEditedTitle(prevTitle)}
    showControls={false} 
    className = "title-edit-mode"
    >
    {(props, ref) => {
      const { value, plaintext, ...rest } = props;

      return plaintext ? (
        <span className="title-read-mode"> {value}</span>
      ) : (
        <input
          {...rest}
          ref={ref}
          value={value}
          //className = "title-edit-mode"
          onChange={(e) => setEditedTitle(e.target.value)}
        />
      );
    }}
  </InlineEdit>
  </>
  );
};

export default EditableTitle;
