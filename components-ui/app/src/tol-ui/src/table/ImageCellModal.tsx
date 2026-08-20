/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import type { MouseEventHandler } from "react";

import { Modal, encodeImageSrc } from "..";

export interface PImageCellModal {
  /**
   * URL of the image to show in the
   */
  imageUrl: string;
  /**
   * Caption to show under the image
   */
  caption: string;
  /**
   * Whether the modal is open
   */
  open: boolean;
  /**
   * State setter for the modal being open
   */
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function ImageCellModal(props: PImageCellModal) {
  const { imageUrl, caption, open, setOpen } = props;

  const [isImageFullscreen, setIsImageFullscreen] = useState<boolean>(false)

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
            src={encodeImageSrc(imageUrl)}
            className="tol-table-image-modal-image"
            title={imageUrl}
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
