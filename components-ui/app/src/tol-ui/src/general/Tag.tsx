/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode } from "react";


export interface PTag {
  /**
   * The content to be displayed inside the tag. Can be a string or any React node.
   */
  value: ReactNode;
  /**
   * The tag colour, uses the ToL colour palette.
   */
  type?: string;
}

/**
 * A simple tag component, can be overidden with a different colour type
 */
export function Tag(props: PTag) {
  const { value, type } = props;

  const style = type ? ({
    backgroundColor: `var(--tol-${type})`,
    color: `var(--tol-light)`
  }) : undefined;

  return (
    <div className="tol-tag" style={style}>
      {value}
    </div>
  );
}
