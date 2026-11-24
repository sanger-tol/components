/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode } from "react";
import { IComponentBase, UtilityBar, mergeUtilityBarConfigs, getVisibleUtilityBarButtons, joinClassNames } from "..";


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

  const mergedUtilityBarConfig = mergeUtilityBarConfigs(utilityBarConfig ?? undefined);
  const buttons = getVisibleUtilityBarButtons(mergedUtilityBarConfig.buttons);
  const elements = (mergedUtilityBarConfig.elements ?? []).filter(Boolean);
  const noLeftSide = utilityBarConfig?.noLeftSide ?? false;
  const ubc = {
    ...mergedUtilityBarConfig,
    noLeftSide,
    buttons,
    elements,
  };

  // The edge description marker renders visibly but does not occupy a toolbar row.
  const hasUtilityBarContent = Boolean(
    (!noLeftSide && (ubc.title || ubc.description)) || buttons.length || elements.length,
  );
  // Only row-consuming toolbar content should reduce the available component height.
  const hasUtilityBarLayout = Boolean(
    (!noLeftSide && ubc.title) || buttons.length || elements.length,
  );

  return (
    <div
      id={id}
      style={{ height }}
    >
      {hasUtilityBarContent && <UtilityBar id={id} {...ubc} />}
      <div
        className={joinClassNames(
          "tol-component-contents",
          hasUtilityBarLayout ? "with-offset" : undefined,
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

