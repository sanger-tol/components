/*
 * SPDX-FileCopyrightText: 2024 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import { Button, Modal } from "..";


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
        position="right"
        type="success"
        onClick={() => {
          setOpen(false), onConfirmClick();
        }}
        text="Confirm"
        testid="confirm-delete-button"
      />
      <Button
        position="right"
        type="error"
        onClick={() => setOpen(false)}
        text="Cancel"
      />
    </div>
  );

  const Header = (
    <div>
      <h4>Confirm Deletion</h4>
    </div>
  );

  return (
    <div className="confirm-delete-buttons">
      <Modal
        setOpen={setOpen}
        open={open}
        size={"sm"}
        closeButton={false}
        header={Header}
        actionButton={Buttons}
      >
        <div>
          <p style={{ marginBottom: "-6px" }}>
            Are you sure you want to delete this {itemType ?? "item"}?
          </p>
          <p style={{ color: "#d62915" }}>
            Warning: If you delete this {itemType ?? "item"}, you will not be able
            to retrieve it later.
          </p>
        </div>
      </Modal>
    </div>
  );
}
