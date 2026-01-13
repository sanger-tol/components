/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useRef, useLayoutEffect } from "react";
import { CELL_PADDING } from "..";


export interface PAutoHeightCell {
  rowId?: string;
  columnId?: string;
  onHeightChange: (rowId: string, columnId: string, height: number) => void;
  children: React.ReactNode;
}

export function AutoHeightCell(props: PAutoHeightCell) {
  const { rowId, columnId, onHeightChange, children } = props;

  const ref = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (!ref.current || !rowId || !columnId) return;

    const element = ref.current;

    const measure = () => {
      const height = element.offsetHeight + CELL_PADDING;
      if (height) onHeightChange(rowId, columnId, height);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(element);

    return () => observer.disconnect();
  }, [rowId, columnId, onHeightChange]);

  return <div ref={ref}>{children}</div>;
}
