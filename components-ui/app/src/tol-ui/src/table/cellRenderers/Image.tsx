/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { PCell, Icon, Modal } from "../..";
import { useState } from "react";

export interface PImage extends PCell {
  value: string | string[];
  names: string | string[];
}

export function Image(props: PImage) {
  const { value, names } = props;
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [modalIndex, setModalIndex] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);
  const [dropDown, setDropDown] = useState<boolean>(false);

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
    <>
      {multipleImages && (
        <Icon
          icon="caret-left"
          onClick={() => arrowPrev(setModalIndex)}
          size="2x"
        />
      )}
      <img
        src={multipleImages ? value[modalIndex] : value}
        style={{ height: "auto", width: "95%" }}
        title={multipleImages ? value[modalIndex] : value}
      />
      {multipleImages && (
        <Icon
          icon="caret-right"
          onClick={() => arrowNext(setModalIndex)}
          size="2x"
        />
      )}
      <caption style={{ textAlign: "center", width: "500px" }}>
        {multipleImages ? names[modalIndex] : names}
      </caption>
    </>
  );

  const ImageViewerModal = (
    <Modal
      open={open}
      setOpen={setOpen}
      children={Content}
    />
  );

  return (
    <div>
      {ImageViewerModal}
      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {multipleImages ??
          <Icon
            icon="caret-left"
            onClick={() => arrowPrev(setCurrentIndex)}
            size="2x"
          />
        }
        <img
          src={multipleImages ? value[currentIndex] : value}
          style={{ height: "auto", width: "75%" }}
          onClick={() => {
            value.length > 0 && setOpen((prev: boolean) => !prev);
            setModalIndex(currentIndex);
          }}
        />
        {multipleImages ??
          <Icon
            icon="caret-right"
            onClick={() => arrowNext(setCurrentIndex)}
            size="2x"
          />
        }
      </span>
      {/* <div>
        <Icon
          icon={dropDown ? "caret-up" : "caret-down"}
          onClick={() => setDropDown((prev: boolean) => !prev)}
          size="2x"
        />
      </div> */}
    </div>
  );
}
