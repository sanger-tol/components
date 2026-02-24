/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React, { useState } from "react";
import { IHeight } from "..";
import type { MouseEventHandler } from "react";
import { ImagesModalComponent } from "./ImagesModalComponent";

/**
 * A single image that has been formatted correctly.
 *
 */

export interface PImageComponent extends IHeight {
  /**
   * The href for the image
   */
  link: string;
  /**
   * If true, the default is that the image should be 100% the height of the div, but allow for filling to the width instead
   */
  fill?: boolean;
  /**
   * What to do when clicking the image
   */
  onClick?: MouseEventHandler<HTMLImageElement>;
  /**
   * If true, clicking the image will open it in a larger modal view
   */
  enableModal?: boolean;
  /**
   * Optional className to apply to the image
   */
  className?: string;
  /**
   * Optional style overrides for the image
   */
  style?: React.CSSProperties;
}

export function ImageComponent(props: PImageComponent) {
  const { link, height, fill = false, onClick, enableModal = false, className, style } = props;
  const [modalOpen, setModalOpen] = useState(false);

  const imageStyle: React.CSSProperties = {
    ...(height ? { ["--tol-image-height" as string]: height } : {}),
    ...style,
  };

  const imageClassName = [
    "tol-image",
    "tol-component-content",
    fill ? "tol-image--fill" : "",
    (onClick || enableModal) ? "tol-image--clickable" : "",
    className || "",
  ].filter(Boolean).join(" ");

  const handleClick: MouseEventHandler<HTMLImageElement> = (e) => {
    if (onClick) {
      onClick(e);
    }
    if (enableModal) {
      setModalOpen(true);
    }
  };

  return (
    <>
      <img
        src={link}
        style={imageStyle}
        onClick={handleClick}
        alt="Image"
        className={imageClassName}
      />
      {enableModal && (
        <ImagesModalComponent
          open={modalOpen}
          setOpen={setModalOpen}
          links={[link]}
          link={link}
        />
      )}
    </>
  );
}
