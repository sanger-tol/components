/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Modal } from "src/general";

import { Dispatch, SetStateAction } from "react";

interface PCellRendererModal {
  open: boolean,
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export default function CellRendererModal(props: PCellRendererModal) {
  const { open, setOpen } = props;

  const Header = <h5>Configure Cell Renderer</h5>;

  return (
    <Modal 
      header={Header}
      open={open}
      setOpen={setOpen}
      size="sm"
    >
      <p>TEST</p>
    </Modal>
  )
}
