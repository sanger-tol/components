/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import { Icon, Modal } from "..";

export interface PImageModal {
  value: string | string[];
  captions: string | string[];
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  currentIndex: number;
}

export function ImageModal(props: PImageModal) {
  const { value, captions, open, setOpen, currentIndex } = props;
  const [modalIndex, setModalIndex] = useState<number>(currentIndex);

  useEffect(() => {
    if (Array.isArray(value)) {
      const max = value.length - 1;
      setModalIndex(Math.max(0, Math.min(currentIndex, max)));
    } else {
      setModalIndex(currentIndex);
    }
  }, [currentIndex, value]);

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

  const Content = (
    <div style={{ textAlign: "center" }}>
      {multipleImages && (
        <Icon
          icon="caret-left"
          onClick={() => arrowPrev(setModalIndex)}
          size="2x"
          className="tol-table-image-cell-arrow"
        />
      )}
      <img
        src={multipleImages ? value[modalIndex] : value}
        className={'tol-table-image-modal-image'}
        title={multipleImages ? value[modalIndex] : value}
      />
      {multipleImages && (
        <Icon
          icon="caret-right"
          onClick={() => arrowNext(setModalIndex)}
          size="2x"
          className="tol-table-image-cell-arrow"
        />
      )}
      <p className={"tol-table-image-modal-caption"}>
        {multipleImages ? captions[modalIndex] : captions}
      </p>
    </div>
  );

  return (
    <Modal
      open={open}
      setOpen={setOpen}
      children={Content}
    />
  );
}
