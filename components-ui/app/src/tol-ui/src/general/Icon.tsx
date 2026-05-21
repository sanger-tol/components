/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MouseEvent } from "react";

export interface PIcon {
  /**
   * The FontAwesome icon name
   */
  icon?: string;
  /**
   * Icon size (2xs, xs, sm, lg, xl, 2xl, or nx where 1 <= n <= 10)
   */
  size?: string;
  /**
   * CSS colour expression
   */
  colour?: string;
  /**
   * Other FontAwesome options applied to the icon (e.g. "solid")
   */
  config?: string;
  /**
   * Class name to add to this icon
   */
  className?: string;
  /**
   * Handler for if this icon is clicked
   */
  onClick?: MouseEvent<HTMLSpanElement>;
}

/**
 * @autodoc
 * 
 * Displays an icon from the FontAwesome icon set (determined by the `icon` passed in).
 * Accepts additional options such as config and colour.
 */
export function Icon(props: PIcon) {
  const { icon, size, colour, config = "solid", className, onClick } = props;

  return (
    <span className={className} onClick={onClick}>
      {/* @ts-ignore */}
      <FontAwesomeIcon icon={`fa-${config} fa-${icon}`} size={size} color={colour} />
    </span>
  );
}
