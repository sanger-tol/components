/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { Icon, Modal } from "..";

export interface PImageModal {
  value: string | string[];
  names: string | string[];
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  currentIndex: number;
}

export function ImageModal(props: PImageModal) {
  const { value, names, open, setOpen, currentIndex } = props;
  const [modalIndex, setModalIndex] = useState<number>(currentIndex);

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
        />
      )}
      <img
        src={multipleImages ? value[modalIndex] : value}
        style={{ minHeight: "200px", minWidth: "200px", maxHeight: "650px", maxWidth: "95%", borderRadius: '6px' }}
        title={multipleImages ? value[modalIndex] : value}
      />
      {multipleImages && (
        <Icon
          icon="caret-right"
          onClick={() => arrowNext(setModalIndex)}
          size="2x"
        />
      )}
      <caption style={{ textAlign: "center", width: 'max-content', color: 'var(--tol-text)' }}>
        {multipleImages ? names[modalIndex] : names}
      </caption>
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
