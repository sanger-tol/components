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
    height: fill ? "auto" : (height || "100%"),
    width: fill ? "100%" : "auto",
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
    cursor: (onClick || enableModal) ? "pointer" : "default",
  };

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
        style={{ ...imageStyle, ...style }}
        onClick={handleClick}
        alt="Image"
        className={`tol-image tol-component-content${className ? ` ${className}` : ""}`}
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
