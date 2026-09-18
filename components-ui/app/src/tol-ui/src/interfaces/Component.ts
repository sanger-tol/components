/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { CSSProperties, ComponentPropsWithoutRef, ReactNode } from "react";
import type { IRemoteTargetAndZone, TUtilityBarOrNull, IFieldMeta, TDataRecord } from "..";

// TODO FUTURE: Remove IHeightDeprecated and migrate all components to use the height property in IComponentBase.
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
  /** Ensure that each component has a unique identifier. */
  id: string;
  /** A list of CSS class names to apply to this component. */
  classNames?: string[];
  /** Custom contents to render in place of the default component body. */
  contents?: ReactNode;
  /** The height of this component as a React CSS value, such as "100%" or 320. */
  height?: CSSProperties["height"];
  /** Configuration for the utility bar associated with this component. */
  utilityBarConfig?: TUtilityBarOrNull;
  /** Flipping this property forces the component to update its rendering. */
  forceUpdate?: boolean;
  /** Loading state for components that fetch content, shown in place of the component's body. */
  isLoading?: boolean;
  /** Error message for components that encounter an error while fetching content. */
  errorMessage?: string;
  /** Warning message for components that encounter a non-critical issue while fetching content. */
  warningMessage?: string;
}

export interface IComponentList extends IComponentBase {
  /** The fields associated with this component. */
  fields: IFieldMeta;
  /** The data associated with this component, where each key maps to a ReactNode. */
  data: TDataRecord;
}

/** Base properties for components that fetch their own data from a remote data source. */
export interface IRemoteComponentBase extends IComponentBase, IRemoteTargetAndZone {}

/** State required for pagination controls. */
export interface IPagination {
  /** The current active page. */
  page: number;
  /** Callback to change the active page. */
  setPage: (page: number) => void;
  /** The number of rows displayed per page. */
  pageSize: number;
  /** Callback to change the page size. */
  setPageSize: (pageSize: number) => void;
  /** The total number of rows across all pages. */
  totalSize: number;
}

/** Used for a list component that fetches its data remotely and supports pagination. */
export interface IRemoteComponentList extends IRemoteComponentBase, IPagination {}
