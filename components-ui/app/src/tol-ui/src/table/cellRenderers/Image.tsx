/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Icon, ImageModal, PCellDisplay } from "../..";
import { useState } from "react";

export interface PImage extends PCellDisplay {
  value: string | string[];
  captions: string | string[];
}

export function Image(props: PImage) {
  const { value, captions } = props;

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);

  const multipleImages = Array.isArray(value);

  const arrowPrev = (
    setIndex: React.Dispatch<React.SetStateAction<number>>
  ) => {
    setIndex((prev) => (prev === 0 ? value.length - 1 : prev - 1));
  };

  const arrowNext = (
    setIndex: React.Dispatch<React.SetStateAction<number>>
  ) => {
    setIndex((prev) => (prev === value.length - 1 ? 0 : prev + 1));
  };

  return (
    <div>
      <ImageModal
        value={value}
        captions={captions}
        open={open}
        setOpen={setOpen}
        currentIndex={currentIndex}
      />
      <span className={"tol-table-image-cell"}>
        {multipleImages && (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Icon
              icon="caret-left"
              onClick={() => arrowPrev(setCurrentIndex)}
              size="1x"
              className={"tol-table-image-cell-arrow"}
            />
          </div>
        )}
        <img
          src={multipleImages ? value[currentIndex] : value}
          style={{ maxHeight: "60px", }}
          onClick={() => {
            value.length > 0 && setOpen((prev: boolean) => !prev);
          }}
        />
        {multipleImages && (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Icon
              icon="caret-right"
              onClick={() => arrowNext(setCurrentIndex)}
              size="1x"
              className={"tol-table-image-cell-arrow"}
            />
          </div>
        )}
      </span>
    </div>
  );
}
