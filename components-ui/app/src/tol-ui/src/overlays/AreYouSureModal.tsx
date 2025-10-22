/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button, Modal } from "..";


export interface PAreYouSureModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSave?: () => void;
  onDiscard?: () => void;
  onCancel?: () => void;
}

export function AreYouSureModal(props: PAreYouSureModalProps) {
  const {
    open,
    setOpen,
    onSave = () => { },
    onDiscard = () => { },
    onCancel = () => { },
  } = props;

  return (
    <Modal
      pendingChanges
      open={open}
      setOpen={setOpen}
      size="sm"
      closeButton={false}
    >
      <h5>Unsaved Changes</h5>
      <p>
        You have an unsaved configuration. Are you sure you want to close without saving?
      </p>
      <Button
        text="Save & Close"
        type="success"
        position="right"
        onClick={() => {
          setOpen(false);
          onSave();
        }}
      />
      <Button
        text="Cancel"
        type="error"
        position="right"
        onClick={() => {
          setOpen(false);
          onCancel();
        }}
      />
      <Button
        text="Discard Changes & Close"
        type="grey"
        position="right"
        onClick={() => {
          setOpen(false);
          onDiscard();
        }}
      />
    </Modal>
  );
}