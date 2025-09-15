/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, Dispatch, SetStateAction } from "react";
import {
  CellRendererType,
  FieldMeta,
  TCellRendererType,
  SingleSelect,
  Modal,
  normaliseCaps
} from "..";


interface PCellRendererModal {
  open: boolean,
  setOpen: Dispatch<SetStateAction<boolean>>,
  attributeId: string,
  fieldMeta: FieldMeta
}

export function CellRendererModal(props: PCellRendererModal) {
  const { open, setOpen, attributeId } = props;

  const [value, setValue] = useState<TCellRendererType>();

  const Header = <h5>Configure Cell Renderer: {attributeId}</h5>;

  return (
    <Modal 
      header={Header}
      open={open}
      setOpen={setOpen}
      size="sm"
    >
      <SingleSelect
        block
        value={value}
        setValue={setValue}
        data={CellRendererType.map(cellRendererType => ({
          label: normaliseCaps(cellRendererType),
          value: cellRendererType
        }))}
      />
    </Modal>
  )
}
