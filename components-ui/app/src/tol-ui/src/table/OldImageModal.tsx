/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Modal, encodeImageSrc } from "..";


export interface POldImageModal {
  value: string;
  caption: string;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function OldImageModal(props: POldImageModal) {
  const { value, caption, open, setOpen } = props;

  return (
    <Modal
      className="tol-data-point-old-image-modal"
      size="lg"
      open={open}
      setOpen={setOpen}
    >
      <div className="tol-data-point-old-image-modal-container">
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
