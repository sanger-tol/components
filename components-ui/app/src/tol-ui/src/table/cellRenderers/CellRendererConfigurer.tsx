/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Dispatch, SetStateAction, useState } from "react";
import {
  CellRendererModal,
  IFieldMeta,
  Icon,
  IRemoteTarget,
} from "../..";

export interface PCellRendererConfigurer extends IRemoteTarget {
  /**
   * The table column being configured
   */
  attributeId: string,
  /**
   * The metadata for the field being configured: where the cell renderer options are stored.
   * It is often written to be reference rather than the state setter.
   * */
  fieldMeta: IFieldMeta
  /**
   * State setter for `fieldMeta`. Typically, changes are applied by writing to `fieldMeta` directly,
   * then this is called to 'formally apply' the changes (`setFieldMeta({ ...fieldMeta })`)
   */
  setFieldMeta: Dispatch<SetStateAction<IFieldMeta>>,
}

/**
 * The palette icon in the column config drawer that open the cell renderer modal
 */
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
