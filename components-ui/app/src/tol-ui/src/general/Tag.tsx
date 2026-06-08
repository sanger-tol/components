/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode } from "react";

import type { TColours } from "..";


export interface PTag {
  /**
   * The content to be displayed inside the tag. Can be a string or any React node.
   */
  children?: ReactNode;
  /**
   * The tag colour, uses the ToL colour palette.
   */
  type?: TColours;
}

/**
 * A simple tag component, can be overidden with a different colour type
 */
export function Tag(props: PTag) {
  const { children, type } = props;

  const style = type ? ({
    backgroundColor: `var(--tol-${type})`,
    color: `var(--tol-${type == "bg" ? "text" : "light"})`
  }) : undefined;

  return (
    <div className="tol-tag" style={style}>
      {children}
    </div>
  );
}
