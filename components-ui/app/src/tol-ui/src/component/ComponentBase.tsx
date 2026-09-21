/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode } from "react";
import { IComponentBase, UtilityBar, mergeUtilityBarConfigs, joinClassNames } from "..";


/** Props for the `ComponentBase` wrapper component. */
export interface PComponentBase extends IComponentBase {
  /** The component's own body, rendered when no override `contents` is supplied. */
  children?: ReactNode;
}

/**
 * Generic wrapper shared by all top-level components (charts, tables, maps, etc).
 *
 * Renders the functionality common to all top-level components, so individual implementations
 * only need to provide their own body via `children`.
 */
export function ComponentBase(props: PComponentBase) {
  const {
    id,
    className,
    classNames = [],
    style,
    contents,
    height = "100%",
    utilityBarConfig,
    children,
  } = props;

  const ubc = mergeUtilityBarConfigs(utilityBarConfig ?? undefined);

  return (
    <div
      id={id}
      style={{ height }}
    >
      {utilityBarConfig !== null && <UtilityBar id={id} {...ubc} />}
      <div
        className={joinClassNames(
          "tol-component-contents",
          utilityBarConfig !== null ? "with-offset" : undefined,
          className,
          ...classNames,
        )}
        style={style}
      >
        {contents ?? children}
      </div>
    </div>
  );
}

