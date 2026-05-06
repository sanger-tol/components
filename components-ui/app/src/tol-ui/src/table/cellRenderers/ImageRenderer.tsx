/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { Image, ImagesModal, PCellDisplay, encodeImageSrc } from "../..";

export interface PImageRenderer extends PCellDisplay {
  captions: string; // kept as plural to avoid alembic upgrade for now
}

export function ImageRenderer(props: PImageRenderer) {
  const { value, captions } = props;

  const links = (Array.isArray(value) ? value : [value])
    .filter(Boolean)
    .map((link) => encodeImageSrc(String(link)));
  const [link, setLink] = useState(links[0] || "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!links.length) {
      setLink("");
      setOpen(false);
      return;
    }
    if (!links.includes(link)) {
      setLink(links[0]);
    }
  }, [links, link]);

  if (!links.length) return null;

  return (
    <div className="tol-table-image-cell tol-table-image-cell--list4">
      <Image
        link={link}
        height={80}
        alt={captions}
        onClick={() => setOpen(true)}
      />
      <ImagesModal
        open={open}
        setOpen={setOpen}
        links={links}
        link={link}
        setLink={setLink}
        alt={captions}
      />
    </div>
  );
}