/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import {
  CellRendererModal,
  FieldMeta,
  ICellRenderer,
  Icon,
  IRemoteTarget,
} from "..";


export interface PCellRendererConfigurer extends IRemoteTarget {
  attributeId: string,
  fieldMeta: FieldMeta
  onSave: (cellRenderers: ICellRenderer, attributeId: string) => void
}

export function CellRendererConfigurer(props: PCellRendererConfigurer) {
  const [modelOpen, setModalOpen] = useState(false);

  const ConfigureCellRendererOpenIcon = (
    <div
      className={"tol-active-column-btn tol-palette-icon"}
      onClick={() => setModalOpen(true)}
    >
      <Icon icon="palette" size="lg" />
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
