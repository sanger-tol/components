/*
 * SPDX-FileCopyrightText: 2024 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import Modal from "../general/Modal";
import { Button } from "../index";

interface Props {
  setOpen: any;
  open: any;
  onConfirmClick?: any;
  itemType?: string;
}

export function ConfirmationModal(props: Props) {
  const { setOpen, open, onConfirmClick, itemType } = props;

  const actionButtons = (
    <div style={{ paddingBottom: "35px" }}>
      <Button
        position="right"
        type="success"
        onClick={() => {
          setOpen(false), onConfirmClick();
        }}
        text="Confirm"
      />
      <Button
        position="right"
        type="error"
        onClick={() => setOpen(false)}
        text="Cancel"
      />
    </div>
  );

  const header = (
    <div>
      <h4>Confirm Deletion</h4>
    </div>
  );

  const body = (
    <div>
      <p style={{ marginBottom: "-6px" }}>
        Are you sure you want to delete this {itemType ?? "item"}?
      </p>
      <p style={{ color: "#d62915" }}>
        Warning: If you delete this {itemType ?? "item"}, you will not be able
        to retrieve it later.
      </p>
    </div>
  );

  return (
    <div className="confirm-delete-buttons">
      <Modal
        setOpen={setOpen}
        open={open}
        size={"sm"}
        children={body}
        closeButton={false}
        header={header}
        actionButton={actionButtons}
      />
    </div>
  );
}
