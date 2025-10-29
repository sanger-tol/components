/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import {
  CellRendererModal,
  FieldMeta,
  Icon,
  IRemoteTarget,
} from "../..";


export interface PCellRendererConfigurer extends IRemoteTarget {
  attributeId: string,
  fieldMeta: FieldMeta
  setFieldMeta: (fieldMeta: FieldMeta) => void,
}

export function CellRendererConfigurer(props: PCellRendererConfigurer) {
  const { attributeId, fieldMeta } = props;
  const [modelOpen, setModalOpen] = useState(false);

  const cellRendererExists = !!fieldMeta.dataWithDefaults?.[attributeId]?.cellRenderer;

  const ConfigureCellRendererOpenIcon = (
    <div
      className={
        "tol-active-column-btn tol-palette-icon"
        + (cellRendererExists ? " active" : "")
      }
      onClick={() => setModalOpen(true)}
    >
      <Icon icon="palette"/>
    </div>
  );

  return (
    <div>
      {ConfigureCellRendererOpenIcon}
      <CellRendererModal
        {...props}
        open={modelOpen}
        setOpen={setModalOpen}
      />
    </div>
  )
}
