/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button, BUTTONS, Modal } from "../..";

export interface PCustomFieldModal {
  /** Whether the modal is currently open */
  open: boolean;
  /** Callback to control whether this modal is open */
  setOpen: (open: boolean) => void;
  /** The ID of the custom field to edit. If `undefined`, this modal creates a new field */
  customFieldId?: number | undefined;
}

export default function CustomFieldModal(props: PCustomFieldModal) {
  const { open, setOpen, customFieldId } = props;

  return (
    <Modal
      open={open}
      setOpen={setOpen}
      header={<h4>{customFieldId ? "Edit Custom Field" : "Create Custom Field"}</h4>}
      actionButton={<Button {...BUTTONS.CONFIRM} />}
    >
      Editing {customFieldId ? "field with ID " + customFieldId : "new field"}
    </Modal>
  );
}
