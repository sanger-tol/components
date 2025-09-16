/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { PCell, Icon, Modal } from "../..";
import { useState } from "react";

export function Image(props: PCell) {
  const { value } = props;
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [modalIndex, setModalIndex] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);
  const [dropDown, setDropDown] = useState<boolean>(false);

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

  const Content = (
    <>
      <Icon
        className="tol-table-image-cell-arrow"
        icon="caret-left"
        onClick={() => arrowPrev(setModalIndex)}
        size="2x"
      />
      <img
        src={value[modalIndex]}
        className="tol-table-image-cell-image"
        title={value[modalIndex]}
      />
      <Icon
        className="tol-table-image-cell-arrow"
        icon="caret-right"
        onClick={() => arrowNext(setModalIndex)}
        size="2x"
      />
      <caption className="tol-table-modal-image-caption">
        {value[modalIndex]}
      </caption>
    </>
  );

  const ImageViewerModal = (
    <Modal
      open={open}
      setOpen={setOpen}
      children={Content}
      className="tol-table-image-modal"
    />
  );

  return (
    <>
      {ImageViewerModal}
      <div className="tol-table-image-cell">
        <Icon
          className="tol-table-image-cell-arrow"
          icon="caret-left"
          onClick={() => arrowPrev(setCurrentIndex)}
          size="2x"
        />
        <img
          src={value[currentIndex]}
          className="tol-table-image-cell-image"
          onClick={() => {
            setOpen((prev: boolean) => !prev);
            setModalIndex(currentIndex);
          }}
        />
        <div className="tol-table-image-cell-right-column">
          <Icon
            className="tol-table-image-cell-arrow"
            icon="caret-right"
            onClick={() => arrowNext(setCurrentIndex)}
            size="2x"
          />
          <Icon
            className="tol-table-image-cell-down"
            icon={dropDown ? "caret-up" : "caret-down"}
            onClick={() => setDropDown((prev:boolean) => !prev)}
            size="2x"
          />
        </div>
      </div>
    </>
  );
}
