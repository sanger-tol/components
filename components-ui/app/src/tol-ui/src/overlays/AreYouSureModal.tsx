/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button, buttons, Modal } from "..";


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
        {...buttons.save}
        position="right"
        onClick={() => {
          setOpen(false);
          onSave();
        }}
      />
      <Button
        {...buttons.discard}
        position="right"
        onClick={() => {
          setOpen(false);
          onDiscard();
        }}
      />
      <Button
        {...buttons.cancel}
        position="right"
        onClick={() => {
          setOpen(false);
        }}
      />
    </Modal>
  );
}