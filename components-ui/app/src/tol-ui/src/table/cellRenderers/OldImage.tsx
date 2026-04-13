/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { OldImageModal, PCellDisplay, encodeImageSrc } from "../..";
import { useState } from "react";

export interface POldImage extends PCellDisplay {
  captions: string; // kept as plural to avoid alembic upgrade for now
}

export function OldImage(props: POldImage) {
  const { value, captions } = props;

  const [open, setOpen] = useState<boolean>(false);

  return (
    <div>
      <OldImageModal
        value={value}
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
