/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { CSSProperties, ComponentPropsWithoutRef, ReactNode } from "react";
import type { IRemoteTargetAndZone, TUtilityBarOrNull, IFieldMeta, TCustomDataPointRenderers, TDataRecord, TDataRecordList } from "..";


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
}

/** Loading/error/warning state shared by components that fetch their own data remotely. */
export interface IRemoteStatus {
  /** Whether the component's data is currently being fetched. */
  isLoading?: boolean;
  /** Error message to display in place of the component's contents. */
  errorMessage?: string;
  /** Warning message to display in place of the component's contents. */
  warningMessage?: string;
  /** Message to display when no fields are selected for the component. */
  noFieldsSelected?: boolean;
}

/** State required for pagination controls. */
export interface IPagination {
  /** The current active page. */
  page?: number;
  /** Callback to change the active page. */
  setPage?: (page: number) => void;
  /** The number of rows displayed per page. */
  pageSize?: number;
  /** Callback to change the page size. */
  setPageSize?: (pageSize: number) => void;
  /** The total number of rows across all pages. */
  totalSize?: number;
}

/** Represents a component with associated fields. */
export interface IComponentFields extends IComponentBase {
  /** The fields associated with this component. */
  fields?: IFieldMeta;
}

/** Represents a component with associated data. */
export interface IComponentData<TData = TDataRecord> extends IComponentFields {
  /** The data associated with this component. */
  data?: TData;
}

/** Represents a component with associated list data. */
export interface IComponentListData extends IComponentData<TDataRecordList> { }

/** Base properties for components that fetch their own data from a remote data source. */
export interface IRemoteComponentBase extends IComponentBase, IRemoteStatus { }

/** Interface for a remote component displaying a single data item. */
export interface IRemoteComponentData extends IRemoteComponentBase, IComponentFields {
  /** Custom renderers for data points within this component. */
  customDataPointRenderers?: TCustomDataPointRenderers;
}

/** Interface for a remote component with list capabilities. */
export interface IRemoteComponentDataList extends IRemoteComponentData, IPagination { }
