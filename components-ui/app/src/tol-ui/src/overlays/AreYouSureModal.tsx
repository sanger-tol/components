/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button, BUTTONS, Modal } from "..";


export interface PAreYouSureModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSave?: () => void;
  onDiscard?: () => void;
}

export function AreYouSureModal(props: PAreYouSureModalProps) {
  const {
    open,
    setOpen,
    onSave = () => {},
    onDiscard = () => {},
  } = props;

  return (
    <Modal
      hasPendingChanges
      open={open}
      setOpen={setOpen}
      size="xs"
      closeButton={false}
    >
      <h5>Unsaved Changes</h5>
      <p>
        You have an unsaved configuration. Are you sure you want to close without saving?
      </p>
      <Button
        {...BUTTONS.SAVE}
        onClick={() => {
          setOpen(false);
          onSave();
        }}
      />
      <Button
        {...BUTTONS.DISCARD}
        onClick={() => {
          setOpen(false);
          onDiscard();
        }}
      />
      <Button
        {...BUTTONS.CANCEL}
        onClick={() => {
          setOpen(false);
        }}
      />
    </Modal>
  );
}