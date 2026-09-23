/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactElement, cloneElement, useRef } from "react";
import {
  mergeUtilityBarConfigs,
  Pagination,
  RemoteComponentBase,
  useComponentListData,
} from "..";
import { RecordCounter } from "./RecordCounter";
import type { IComponentData, IRemoteComponentDataList, IRemoteTargetAndZone } from "..";


/** Props for the `RemoteComponentList` wrapper component. */
export interface PRemoteComponentList extends IRemoteComponentDataList, IRemoteTargetAndZone {
  /** The number of items to fetch per page. */
  pageSize?: number;
  /** The single top-level component to enhance with fetched data, e.g. an `<ObjectDetail />`. */
  children: ReactElement<IComponentData>;
}

/**
 * Enhances a single top-level component with data fetched via `useComponentListData`.
 * Wraps the result in `RemoteComponentBase` to handle loading, error, and no-fields-selected states.
 * Also provides pagination controls and a record counter when applicable.
 */
export function RemoteComponentList(props: PRemoteComponentList) {
  const {
    id,
    dataSource,
    objectType,
    fields,
    customDataPointRenderers,
    zone,
    setZone,
    children,
    utilityBarConfig,
    height = "100%",
    ...rest
  } = props;

  const {
    fieldMeta,
    data,
    noFieldsSelected,
    isLoading,
    errorMessage,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalSize,
  } = useComponentListData({
    id,
    objectType,
    dataSource,
    fields,
    zone,
    setZone,
    customDataPointRenderers,
  });

  const parentRef = useRef<HTMLDivElement>(null);

  const showPagination =
    totalSize !== undefined &&
    totalSize > 1;

  const ubc = mergeUtilityBarConfigs(utilityBarConfig ?? undefined, {
    elements: showPagination
      ? [
        <Pagination
          key="pagination"
          parentRef={parentRef}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          totalSize={totalSize}
          pageSizePickerVisible={false}
        />,
      ]
      : [],
  });

  return (
    <div ref={parentRef} style={{ height }}>
      {showPagination && <RecordCounter totalSize={totalSize} loading={isLoading} />}
      <RemoteComponentBase
        {...rest}
        id={id}
        height={height}
        isLoading={isLoading}
        errorMessage={errorMessage}
        noFieldsSelected={noFieldsSelected}
        utilityBarConfig={ubc}
      >
        {cloneElement(children, {
          id,
          data: data[0] ?? {},
          fields: fieldMeta,
        })}
      </RemoteComponentBase>
    </div>
  );
}



