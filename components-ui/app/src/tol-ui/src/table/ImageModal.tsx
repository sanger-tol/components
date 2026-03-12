/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Modal, encodeImageSrc } from "..";


export interface PImageModal {
  value: string;
  caption: string;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function ImageModal(props: PImageModal) {
  const { value, caption, open, setOpen } = props;

  return (
    <Modal
      size="lg"
      open={open}
      setOpen={setOpen}
    >
      <div style={{ textAlign: "center" }}>
        <img
          src={encodeImageSrc(value)}
          className="tol-table-image-modal-image"
          title={value}
        />
        <p className="tol-table-image-modal-caption">
          {caption}
        </p>
      </div>
    </Modal>
  );
}
