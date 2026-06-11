/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode } from "react";

import { LIGHT_COLOURS, TLightColour } from "..";
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
}

/**
 * A simple tag component, can be overidden with a different colour type
 */
export function Tag(props: PTag) {
  const { children, type, className } = props;

  const style = type ? ({
    backgroundColor: `var(--tol-${type})`,
    color: `var(--tol-${Object.values(LIGHT_COLOURS).includes(type as TLightColour) ? "text" : "light"})`
  }) : undefined;

  return (
    <div className={`tol-tag ${className}`} style={style}>
      {children}
    </div>
  );
}
