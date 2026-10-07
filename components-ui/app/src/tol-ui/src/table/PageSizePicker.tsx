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
  /** Test identifier for the picker. */
  "data-testid"?: string;
}

/** Shared page size selector for pagination and configuration drawers. */
export function PageSizePicker(props: PPageSizePicker) {
  const {
    pageSize,
    setPageSize,
    "data-testid": testId,
  } = props;

  const onChange = (value: number | null) => {
    if (value !== null) {
      setPageSize?.(value);
    }
  };

  return (
    <SelectPicker
      {...props}
      data-testid={testId}
      data={PAGE_SIZE_OPTIONS}
      value={pageSize}
      onChange={onChange}
      cleanable={false}
      searchable={false}
    />
  );
}