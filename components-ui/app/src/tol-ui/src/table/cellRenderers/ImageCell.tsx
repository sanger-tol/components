/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ImageCellModal, PCellDisplay, encodeImageSrc } from "../..";
import { useState } from "react";

export interface PImageCell extends PCellDisplay {
  /**
   * The captions to display under the image in the ImageCellModal
   */
  captions: string; // kept as plural to avoid alembic upgrade for now
}

export function ImageCell(props: PImageCell) {
  const { value, captions } = props;

  const [open, setOpen] = useState<boolean>(false);

  return (
    <div>
      <ImageCellModal
        imageUrl={value}
        caption={captions}
        open={open}
        setOpen={setOpen}
      />
      <div
        className="tol-table-image-cell"
        onClick={() => setOpen(true)}
      >
        <img
          src={encodeImageSrc(value)} />
      </div>
    </div>
  );
}
