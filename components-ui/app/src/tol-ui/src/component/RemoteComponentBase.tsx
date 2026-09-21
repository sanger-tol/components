/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode, useRef } from "react";
import { ComponentBase, Pagination, Placeholder, mergeUtilityBarConfigs, IComponentBase, IRemoteStatus, IPagination } from "..";


/** Props for the `RemoteComponentBase` wrapper component. */
export interface PRemoteComponentBase extends IComponentBase, IRemoteStatus, Partial<IPagination> {
  /** The component's own body, rendered when not loading and no error/warning is present. */
  children?: ReactNode;
}

/**
 * Generic wrapper shared by top-level components that fetch their own data remotely.
 *
 * Extends `ComponentBase` with loading/error/warning screens, and, only when pagination props are
 * supplied and there is more than one page of data, a `Pagination` control rendered as a utility bar element.
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
    ...rest
  } = props;

  const parentRef = useRef<HTMLDivElement>(null);

  const showPagination =
    page !== undefined &&
    setPage !== undefined &&
    pageSize !== undefined &&
    setPageSize !== undefined &&
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
        />,
      ]
      : [],
  });

  const ResolveContents = () => {
    if (errorMessage) return <Placeholder errorMessage={errorMessage} height={height} />;
    if (warningMessage) return <Placeholder warningMessage={warningMessage} height={height} />;
    if (isLoading) return <Placeholder loader height={height} />;
    return contents ?? children;
  };

  return (
    <div ref={parentRef} style={{ height }}>
      <ComponentBase
        {...rest}
        height={height}
        utilityBarConfig={utilityBarConfig === null ? null : ubc}
      >
        {ResolveContents()}
      </ComponentBase>
    </div>
  );
}
