/*
 * SPDX-FileCopyrightText: 2024 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import Modal from "../../general/Modal";
import { Button } from "rsuite";

interface Props {
  setOpen: any;
  open: any;
  onConfirmClick?: any;
  itemType?: string;
}

function ConfirmationModal(props: Props) {
  const { setOpen, open, onConfirmClick, itemType } = props;

  const actionButtons = (
    <div>
      <Button
        color={"green"}
        appearance={"ghost"}
        onClick={() => {
          setOpen(false), onConfirmClick();
        }}
      >
        Confirm
      </Button>
      <Button color={"red"} appearance={"ghost"} onClick={() => setOpen(false)}>
        Cancel
      </Button>
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
        Warning: If you delete this {itemType ?? "item"}, you will not be able to retrieve it
        later.
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
        className={"confirm-delete-modal"}
      />
    </div>
  );
}

export default ConfirmationModal;
