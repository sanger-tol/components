/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import type { MouseEventHandler } from "react";

import { Modal, encodeImageSrc } from "..";

export interface PImageCellModal {
  value: string;
  caption: string;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function ImageCellModal(props: PImageCellModal) {
  const { value, caption, open, setOpen } = props;

  const [isImageFullscreen, setIsImageFullscreen] = useState(false)

  const handleFullscreenImage: MouseEventHandler<HTMLImageElement> = (event) => {
    if (isImageFullscreen) {
      document.exitFullscreen();
    } else {
      (event.target as HTMLImageElement).requestFullscreen();
    }

    setIsImageFullscreen(!isImageFullscreen);
  }

  return (
    <Modal
      className="tol-data-point-old-image-modal"
      size="lg"
      open={open}
      setOpen={setOpen}
    >
      <div className="tol-data-point-old-image-modal-container">
        {/*
        There needs to be a span wrapping the image so it doesn't try to grow to fill the flexbox
        */}
        <span>
          <img
            src={encodeImageSrc(value)}
            className="tol-table-image-modal-image"
            title={value}
            onClick={handleFullscreenImage}
            data-fullscreen={isImageFullscreen}
          />
        </span>
        <p className="tol-table-image-modal-caption">
          {caption}
        </p>
      </div>
    </Modal>
  );
}
