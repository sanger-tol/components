/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, Dispatch, SetStateAction } from "react";
import { Input } from "rsuite";
import {
  FieldMeta,
  TCellRendererType,
  CellRendererType,
  SingleSelect,
  Modal,
  normaliseCaps,
} from "..";


interface PCellRendererModal {
  open: boolean,
  setOpen: Dispatch<SetStateAction<boolean>>,
  attributeId: string,
  fieldMeta: FieldMeta
}

export function CellRendererModal(props: PCellRendererModal) {
  const { open, setOpen, attributeId, fieldMeta } = props;
  const renderer = fieldMeta.dataWithDefaults[attributeId].cellRenderer;

  const [value, setValue] = useState<TCellRendererType>(renderer?.type);

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

      {/* Extra options depending on the value selected */}
      {
        renderer?.type === "link" ?
          <Input />
        :
          ""
      }
    </Modal>
  )
}
