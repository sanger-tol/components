/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useRef, useLayoutEffect } from "react";


export interface PAutoHeightCell {
  rowId?: string;
  onHeightChange: (rowId: string, height: number) => void;
  children: React.ReactNode;
}

export function AutoHeightCell(props: PAutoHeightCell) {
  const { rowId, onHeightChange, children } = props;
  const ref = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (!ref.current || !rowId) return;

    const measure = () => {
      const h = ref.current!.offsetHeight + 24; // padding fudge
      console.log(h);
      if (h) onHeightChange(rowId, h);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [rowId, onHeightChange]);

  return <div ref={ref}>{children}</div>;
}
