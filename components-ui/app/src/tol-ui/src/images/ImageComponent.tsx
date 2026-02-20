/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { IHeight } from "..";
import type { CSSProperties, MouseEventHandler } from "react";

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
}

export function ImageComponent(props: PImageComponent) {
  const { link, height, fill = false, onClick } = props;

  const imageStyle: CSSProperties = {
    height: fill ? "auto" : (height || "100%"),
    width: fill ? "100%" : "auto",
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
    cursor: onClick ? "pointer" : "default",
  };

  return (
    <img
      src={link}
      style={imageStyle}
      onClick={onClick}
      alt="Image"
      className="tol-image"
    />
  );
}
