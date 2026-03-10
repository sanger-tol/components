/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { ImageModal } from "../..";


export interface PImages {
  value: any;
  captions: any;
}

export function Images(props: PImages) {
  const { value, captions } = props;

  const [open, setOpen] = useState<boolean>(false);

  // could be single or multiple images
  const urlList = Array.isArray(value) ? value : [value];
  return (
    <div className="tol-table-expanded-row">
      <ImageModal
        value={value}
        caption={captions}
        open={open}
        setOpen={setOpen}
      />
      {urlList.map((url, index) => (
        <img
          // className={currentIndex != index ? "tol-table-expanded-row-img": "tol-table-expanded-row-img-active"}
          className="tol-table-expanded-row-img"
          key={url}
          src={url}
          alt={captions[index] || url}
          onClick={() => {
            setOpen(true)
          }}
        />
      ))}
    </div>
  );
}
