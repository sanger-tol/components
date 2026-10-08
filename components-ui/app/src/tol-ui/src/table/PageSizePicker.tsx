/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { SelectPicker } from "rsuite";
import { PAGE_SIZE_OPTIONS } from "../constants/table.constants";
import type { IPagination } from "../interfaces/Component";


/** Props for the `PageSizePicker` component. */
export interface PPageSizePicker extends Pick<IPagination, "pageSize" | "setPageSize"> {
  /** Whether the picker fills its container. */
  block?: boolean;
  /** The size of the picker. */
  size?: "xs" | "sm" | "md" | "lg";
  /** Whether the page size picker should allow selecting the 1 option. */
  pageSizeOfOneIsSelectable?: boolean;
  /** Test identifier for the picker. */
  "data-testid"?: string;
}

/** Shared page size selector for pagination and configuration drawers. */
export function PageSizePicker(props: PPageSizePicker) {
  const {
    pageSize,
    setPageSize,
    block,
    size,
    "data-testid": testId,
    pageSizeOfOneIsSelectable = true,
  } = props;

  const onChange = (value: number | null) => {
    if (value !== null) {
      setPageSize?.(value);
    }
  };

  return (
    <SelectPicker
      block={block}
      size={size}
      data-testid={testId}
      data={PAGE_SIZE_OPTIONS(pageSizeOfOneIsSelectable)}
      value={pageSize}
      onChange={onChange}
      cleanable={false}
      searchable={false}
    />
  );
}