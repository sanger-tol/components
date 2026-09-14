/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { CSSProperties, ComponentPropsWithoutRef, ReactNode } from "react";
import type { IRemoteTargetAndZone, TUtilityBarOrNull } from "..";

/** Represents the height property for a component. Will be deprecated in future versions. */
export interface IHeightDeprecated {
  /** The height of this component as a React CSS value, such as "100%" or 320. */
  height?: CSSProperties["height"];
}

/**
 * Represents the base properties for a component.
 * 
 * id, className, style (etc) are inherited from ComponentPropsWithoutRef<"div">,
 * so they are not explicitly defined here.
 */
export interface IComponentBase extends ComponentPropsWithoutRef<"div"> {
  /** Loading state for components that fetch content. */
  loading?: boolean;
  /** Custom contents to render in place of the default component body. */
  contents?: ReactNode;
  /** The height of this component as a React CSS value, such as "100%" or 320. */
  height?: CSSProperties["height"];
  /** Configuration for the utility bar associated with this component. */
  utilityBarConfig?: TUtilityBarOrNull;
  /** Flipping this property forces the component to update its rendering. */
  forceUpdate?: boolean;
}

/** Base properties for components that fetch their own data from a remote data source. */
export interface IRemoteComponentBase extends IComponentBase, IRemoteTargetAndZone {}
