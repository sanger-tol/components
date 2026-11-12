/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconProp, SizeProp } from "@fortawesome/fontawesome-svg-core";
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
  /** Whether the clickable icon is disabled. */
  disabled?: boolean;
  /** Accessible name for a clickable icon; defaults to its tooltip or icon name. */
  "aria-label"?: string;
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
 * Renders a native button when an onClick handler is provided.
 */
export function Icon(props: PIcon) {
  const {
    icon, size, colour, config = "solid", className, onClick, tooltip, testid,
    disabled, "aria-label": ariaLabel,
  } = props;

  const prefix = config === "brands" ? "fab" : config === "regular" ? "far" : "fas";
  const IconContents = (
    <FontAwesomeIcon
      icon={[prefix, icon] as IconProp}
      size={size as SizeProp}
      color={colour}
    />
  );

  const contents = tooltip ? (
    <HoverOverlay contents={tooltip}>
      {IconContents}
    </HoverOverlay>
  ) : IconContents;
  const iconClassName = "tol-icon" + (className ? ` ${className}` : "");

  if (onClick) {
    return (
      <button
        type="button"
        className={iconClassName}
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel ?? tooltip ?? icon}
        data-testid={testid}
      >
        {contents}
      </button>
    );
  }

  return (
    <span className={iconClassName} data-testid={testid}>
      {contents}
    </span>
  );
}
