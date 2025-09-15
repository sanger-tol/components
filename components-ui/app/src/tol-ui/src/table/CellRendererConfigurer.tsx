/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { CellRendererModal, FieldMeta, Icon } from "..";


export interface PCellRendererConfigurer {
  attributeId: string,
  fieldMeta: FieldMeta
}

export function CellRendererConfigurer(props: PCellRendererConfigurer) {
  const { attributeId, fieldMeta } = props;
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
        open={modelOpen}
        setOpen={setModalOpen}
        attributeId={attributeId}
        fieldMeta={fieldMeta}
      />
    </div>
  )
}
