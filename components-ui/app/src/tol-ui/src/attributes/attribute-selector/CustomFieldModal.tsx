/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { Dispatch, SetStateAction } from "react";

import { Modal } from "../..";

export interface PCustomFieldModal {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  /** The ID of the custom field to edit. If `undefined`, this modal creates a new field */
  customFieldId?: number | undefined;
}

export default function CustomFieldModal(props: PCustomFieldModal) {
  const { open, setOpen, customFieldId } = props;

  return (
    <Modal open={open} setOpen={setOpen}>
      Editing {customFieldId ? "field with ID " + customFieldId : "new field"}
    </Modal>
  );
}
