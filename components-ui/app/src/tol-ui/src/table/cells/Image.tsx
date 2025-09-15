/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { PCell, Icon, Modal } from "../..";
import { useState } from "react";

export function Image(props: PCell) {
  const { value } = props;
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);

  const arrowPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? value.length - 1 : prev - 1));
  };

  const arrowNext = () => {
    setCurrentIndex((prev) => (prev === value.length - 1 ? 0 : prev + 1));
  };

  const ImageViewerModal = <Modal open={open} setOpen={setOpen} />;

  return (
    <>
      {ImageViewerModal}
      <div
        className="tol-table-image-cell"
        style={{
          marginLeft: "500px",
          width: "250px",
          height: "100px",
          background: "purple",
        }}
      >
        <Icon
          className="tol-table-image-cell-arrow"
          icon="caret-left"
          onClick={arrowPrev}
          size="2x"
        />
        <img
          src={value[currentIndex]}
          className="tol-table-image-cell-image"
          onClick={() => setOpen((prev:boolean)=>!prev)}
        />
        <Icon
          className="tol-table-image-cell-arrow"
          icon="caret-right"
          onClick={arrowNext}
          size="2x"
        />
      </div>
    </>
  );
}
