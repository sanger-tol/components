/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactElement, cloneElement, useRef } from "react";
import { Pagination, Placeholder, mergeUtilityBarConfigs, IComponentBase, IRemoteStatus, IPagination } from "..";
import { RecordCounter } from "./RecordCounter";


/** Props for the `RemoteComponentBase` wrapper component. */
export interface PRemoteComponentBase extends IComponentBase, IRemoteStatus, IPagination {
  /** The single top-level component to enhance, e.g. an `<ObjectDetail />` or `<Table />`. */
  children: ReactElement<IComponentBase>;
}

/**
 * Enhances a top-level component (already wrapped in its own `ComponentBase`) with the behaviour
 * needed by components that fetch their own data remotely, without wrapping it in a second `ComponentBase`.
 *
 * Clones `children`, injecting: a `utilityBarConfig` with a `Pagination` element added when pagination
 * props are supplied and there is more than one page of data, and a `contents` override showing a loading,
 * error, or warning placeholder in place of the child's own body.
 */
export function RemoteComponentBase(props: PRemoteComponentBase) {
  const {
    isLoading,
    errorMessage,
    warningMessage,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalSize,
    height = "100%",
    utilityBarConfig,
    contents,
    children,
  } = props;

  const parentRef = useRef<HTMLDivElement>(null);

  const showPagination =
    page !== undefined &&
    setPage !== undefined &&
    pageSize !== undefined &&
    setPageSize !== undefined &&
    totalSize !== undefined &&
    totalSize > 1;

  const showCounter = totalSize !== undefined && totalSize > 1;

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

  const resolvedContents = errorMessage
    ? <Placeholder errorMessage={errorMessage} height={height} />
    : warningMessage
      ? <Placeholder warningMessage={warningMessage} height={height} />
      : isLoading
        ? <Placeholder loader height={height} />
        : contents;

  return (
    <div ref={parentRef} className="tol-remote-component-base" style={{ height }}>
      {showCounter && <RecordCounter totalSize={totalSize} loading={isLoading} />}
      {cloneElement(children, {
        height,
        utilityBarConfig: ubc,
        contents: resolvedContents,
      })}
    </div>
  );
}

