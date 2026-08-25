/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { RefObject, useState } from "react";
import { Pagination as RSPagination, SelectPicker } from "rsuite";
import { componentResizeListener, IPagination, PAGE_SIZE_OPTIONS } from "..";


export interface PPagination extends IPagination {
  /**
   * Parent element ref from the table container used for width-based layout.
   */
  parentRef: RefObject<HTMLDivElement | null>;
}

/**
 * A self-contained pagination control that adapts its layout based
 * on the component's width
 */
export function Pagination(props: PPagination) {
  const {
    parentRef,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalSize
  } = props;

  const [isCompact, setIsCompact] = useState<boolean>(false);

  componentResizeListener(parentRef, () => {
    const width = parentRef.current?.offsetWidth;
    if (width !== undefined) setIsCompact(width < 750);
  });

  return (
    <div className="tol-pagination">
      {!isCompact && (
        <span className="tol-page-size">
          <SelectPicker
            value={pageSize}
            onChange={setPageSize}
            size="sm"
            cleanable={false}
            searchable={false}
            data={PAGE_SIZE_OPTIONS}
          />
        </span>
      )}
      <RSPagination
        prev
        next
        boundaryLinks
        className="tol-pagination"
        size="sm"
        layout={isCompact ? ["pager"] : ["pager", "skip"]}
        total={totalSize <= 10000 ? totalSize : 10000}
        activePage={page}
        onChangePage={setPage}
        limit={pageSize}
        onChangeLimit={setPageSize}
        first={!isCompact}
        last={!isCompact}
        ellipsis={!isCompact}
        maxButtons={1}
      />
    </div>
  );
}
