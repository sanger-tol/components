/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { HoverOverlay } from "./HoverOverlay";


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
  onClick?: () => void;
  /**
   * Tooltip to show when this icon is hovered over
   */
  tooltip?: string;
  /**
   * Test ID for Playwright tests
   */
  testid?: string;
}

/**
 * @autodoc
 * 
 * Displays an icon from the FontAwesome icon set (determined by the `icon` passed in).
 * Accepts additional options such as config and colour.
 */
export function Icon(props: PIcon) {
  const { icon, size, colour, config = "solid", className, onClick, tooltip, testid } = props;

  // @ts-ignore
  const IconContents = <FontAwesomeIcon icon={`fa-${config} fa-${icon}`} size={size} color={colour} />;

  return (
    <span
      className={"tol-icon" + (className ? ` ${className}` : "")}
      onClick={onClick} data-testid={testid}
      style={onClick ? {cursor: "pointer"} : {}}
    >
      {tooltip ? (
        <HoverOverlay contents={tooltip}>
          {IconContents}
        </HoverOverlay>
      ) : (
        IconContents
      )}
    </span>
  );
}
