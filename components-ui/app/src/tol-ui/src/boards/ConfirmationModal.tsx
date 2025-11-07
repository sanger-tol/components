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

  const Buttons = (
    <div style={{ paddingBottom: "35px" }}>
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
    </div>
  );

  const Header = (
    <h4>Confirm Deletion</h4>
  );

  return (
    <Modal
      setOpen={setOpen}
      open={open}
      size={"sm"}
      closeButton={false}
      header={Header}
      actionButton={Buttons}
    >
      <p style={{ marginBottom: "-6px" }}>
        Are you sure you want to delete this {itemType ?? "item"}?
      </p>
      <p className="tol-danger-colour">
        Warning: If you delete this {itemType ?? "item"}, you will not be able
        to retrieve it later.
      </p>
    </Modal>
  );
}
