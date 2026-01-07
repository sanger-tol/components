/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useRef, useLayoutEffect } from "react";


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

    const el = ref.current;

    const measure = () => {
      const h = el.offsetHeight + 24; // padding fudge
      if (h) onHeightChange(rowId, columnId, h);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);

    return () => observer.disconnect();
  }, [rowId, columnId, onHeightChange]);

  return <div ref={ref}>{children}</div>;
}