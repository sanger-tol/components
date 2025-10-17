/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { ImageModal } from "../..";

export interface PImages {
  value: any;
  names: any;
}

export function Images(props: PImages) {
  const { value, names } = props;
  const [open, setOpen] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // could be single or multiple images
  const urlList = Array.isArray(value) ? value : [value];
  return (
    <div className="tol-table-expanded-row">
      <ImageModal
        value={value}
        names={names}
        open={open}
        setOpen={setOpen}
        currentIndex={currentIndex}
      />
      {urlList.map((url, index) => (
        <img
          // className={currentIndex != index ? "tol-table-expanded-row-img": "tol-table-expanded-row-img-active"}
          className="tol-table-expanded-row-img"
          key={url}
          src={url}
          alt={names[index] || url}
          onClick={() => {
            setCurrentIndex(index);
            setOpen(true)
          }}
        />
      ))}
    </div>
  );
}
