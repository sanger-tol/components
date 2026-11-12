/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Dispatch, SetStateAction, useState } from "react";
import { AttributeTitle, DatapointRendererConfigurer, Icon, Modal } from "../..";
import type { IFieldMeta, IRemoteTarget } from "../..";

/** Props for the legacy table palette control and modal wrapper. */
export interface PDatapointRendererConfigurerControl extends IRemoteTarget {
  /** Attribute whose datapoint renderer is configured by the opened modal. */
  attributeId: string;
  /** Current field metadata; used to reflect whether a renderer is configured. */
  fieldMeta: IFieldMeta;
  /** Updates the caller's draft metadata when renderer settings are applied. */
  setFieldMeta: Dispatch<SetStateAction<IFieldMeta>>;
}

/**
 * Renders the legacy table palette control and its renderer-configuration modal.
 * NOTE: Keep this wrapper until the table adopts the list configuration flow.
 */
export function DatapointRendererConfigurerControl(props: PDatapointRendererConfigurerControl) {
  const { attributeId, fieldMeta, objectType, dataSource } = props;
  const [modalOpen, setModalOpen] = useState(false);
  const rendererExists = !!fieldMeta.dataWithDefaults?.[attributeId]?.cellRenderer;

  const Header = (
    <h5>
      Configure Cell Renderer for
      <AttributeTitle objectType={objectType} dataSource={dataSource} attributeId={attributeId} />
    </h5>
  );

  return (
    <>
      <div
        className={`tol-active-column-btn tol-palette-icon${rendererExists ? " active" : ""}`}
        onClick={() => setModalOpen(true)}
      >
        <Icon icon="palette" tooltip="Configure DataPoint Renderer" />
      </div>
      <Modal
        open={modalOpen}
        setOpen={setModalOpen}
        header={Header}
        size="xs"
      >
        {modalOpen ? <DatapointRendererConfigurer {...props} /> : <></>}
      </Modal>
    </>
  );
}