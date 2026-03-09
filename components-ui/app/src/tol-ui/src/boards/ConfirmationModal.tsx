/*
 * SPDX-FileCopyrightText: 2024 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import { Button, BUTTONS, Modal } from "..";


export interface PConfirmationModal {
  open: any;
  setOpen: any;
  onConfirmClick?: any;
  itemType?: string;
}

export function ConfirmationModal(props: PConfirmationModal) {
  const { open, setOpen, onConfirmClick, itemType } = props;

  return (
    <Modal
      hasPendingChanges
      open={open}
      setOpen={setOpen}
      size="xs"
      closeButton={false}
    >
      <h5>Confirm Deletion</h5>
      <p>
        Are you sure you want to delete this {itemType ?? "item"}?
      </p>
      <p className="tol-danger-colour">
        Warning: If you delete this {itemType ?? "item"}, you will not be able
        to retrieve it later.
      </p>
      <Button
        {...BUTTONS.CONFIRM}
        onClick={() => {
          setOpen(false), onConfirmClick();
        }}
        testid="confirm-delete-button"
      />
      <Button
        {...BUTTONS.CANCEL}
        onClick={() => setOpen(false)}
      />
    </Modal>
  );
}
