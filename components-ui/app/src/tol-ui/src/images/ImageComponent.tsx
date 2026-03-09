/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from "react";
import { IHeight } from "..";
import type { MouseEventHandler } from "react";

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
   * Optional image alt text for accessibility
   */
  alt?: string;
  /**
   * Optional className to apply to the image
   */
  className?: string;
  /**
   * Optional style overrides for the image
   */
  style?: React.CSSProperties;
}

/**
 * A single image that has been formatted correctly.
 *
 */
export function ImageComponent(props: PImageComponent) {
  const { link, height, fill = false, onClick, alt, className, style } = props;

  const imageStyle: React.CSSProperties = {
    ...(height ? { ["--tol-image-height" as string]: height } : {}),
    ...style,
  };

  const imageClassName = [
    "tol-image",
    "tol-component-content",
    fill ? "tol-image--fill" : "",
    onClick ? "tol-image--clickable" : "",
    className || "",
  ].filter(Boolean).join(" ");

  return (
    <img
      src={link}
      style={imageStyle}
      onClick={onClick}
      alt={alt ?? ""}
      className={imageClassName}
    />
  );
}
