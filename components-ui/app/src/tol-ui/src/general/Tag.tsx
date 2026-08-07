/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode } from "react";

import { HoverOverlay, Icon, LIGHT_COLOURS, TLightColour } from "..";
import type { TColour } from "..";


export interface PTag {
  /**
   * The content to be displayed inside the tag. Can be a string or any React node.
   */
  children?: ReactNode;
  /**
   * The tag colour, uses the ToL colour palette.
   */
  type?: TColour;
  /**
   * CSS class name to allow for additional styles
   */
  className?: string;
  /**
   * Optional FontAwesome icon name to display before the tag content.
   */
  icon?: string;
  /**
   * Optional text to display in a tooltip when the tag is hovered.
   */
  tooltip?: string;
}

/**
 * A simple tag component, can be overidden with a different colour type
 */
export function Tag(props: PTag) {
  const { children, type, className, icon, tooltip } = props;

  const style = type ? ({
    backgroundColor: `var(--tol-${type})`,
    color: `var(--tol-${Object.values(LIGHT_COLOURS).includes(type as TLightColour) ? "text" : "light"})`
  }) : undefined;

  const tag = (
    <div className={`tol-tag${className ? ` ${className}` : ""}`} style={style}>
      {icon && <Icon icon={icon} />}
      {children}
    </div>
  );

  return tooltip ? (
    <HoverOverlay contents={tooltip}>
      {tag}
    </HoverOverlay>
  ) : tag;
}
