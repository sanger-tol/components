import { Dispatch, SetStateAction } from "react";

import { FieldMeta, IRemoteTarget, Modal } from "../..";

export interface PCellRendererModal extends IRemoteTarget {
  open: boolean,
  setOpen: Dispatch<SetStateAction<boolean>>,
  attributeId: string,
  fieldMeta: FieldMeta,
  setFieldMeta: (fieldMeta: FieldMeta) => void,
}

export function CellRendererModal(props: PCellRendererModal) {
  const { open, setOpen } = props;

  return (
    <Modal
      open={open}
      setOpen={setOpen}
    >
      <p>Hey look at my cool modal</p>
    </Modal>
  )
}
