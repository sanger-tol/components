/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ImageModal, PCellDisplay } from "../..";
import { useState } from "react";

export interface PImage extends PCellDisplay {
  value: string;
  captions: string; // kept as plural to avoid alembic upgrade for now
}

export function Image(props: PImage) {
  const { value, captions } = props;

  const [open, setOpen] = useState<boolean>(false);

  return (
    <div>
      <ImageModal
        value={value}
        caption={captions}
        open={open}
        setOpen={setOpen}
      />
      <span
        className={"tol-table-image-cell"}
        onClick={() => setOpen(true)}
      >
        <img src={value} />
        <p>{captions}</p>
      </span>
    </div>
  );
}
