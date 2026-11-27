/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button, BUTTONS, Modal } from "..";
import type { PButton } from "..";


export interface PAreYouSureModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSave?: () => void;
  onDiscard?: () => void;
  title?: string;
  message?: string;
  onConfirm?: () => void;
  confirmButton?: PButton;
}

export function AreYouSureModal(props: PAreYouSureModalProps) {
  const {
    open,
    setOpen,
    onSave = () => {},
    onDiscard = () => {},
    title = "Unsaved Changes",
    message = "You have an unsaved configuration. Are you sure you want to close without saving?",
    onConfirm,
    confirmButton = BUTTONS.CONFIRM,
  } = props;

  return (
    <Modal
      hasPendingChanges
      open={open}
      setOpen={setOpen}
      size="xs"
      closeButton={false}
    >
      <h5>{title}</h5>
      <p>{message}</p>
      {onConfirm ? (
        <Button
          {...confirmButton}
          onClick={() => {
            setOpen(false);
            onConfirm();
          }}
        />
      ) : (
        <>
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
        </>
      )}
      <Button
        {...BUTTONS.CANCEL}
        onClick={() => {
          setOpen(false);
        }}
      />
    </Modal>
  );
}