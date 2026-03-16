/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ImageModal_old, PCellDisplay, encodeImageSrc } from "../..";
import { useState } from "react";

export interface PImage_old extends PCellDisplay {
  value: string;
  captions: string; // kept as plural to avoid alembic upgrade for now
}

export function Image_old(props: PImage_old) {
  const { value, captions } = props;

  const [open, setOpen] = useState<boolean>(false);

  return (
    <div>
      <ImageModal_old
        value={value}
        caption={captions}
        open={open}
        setOpen={setOpen}
      />
      <span
        className={"tol-table-image-cell"}
        onClick={() => setOpen(true)}
      >
        <img src={encodeImageSrc(value)} />
      </span>
    </div>
  );
}
