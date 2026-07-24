/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useLayoutEffect, useRef } from "react";

export function themeListener(fn) {
  useEffect(() => {
    fn();
  }, []);
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      return fn();
    });
}

export function resizeListener(fn: () => void): void {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useLayoutEffect(() => {
    const handleResize = () => fnRef.current();
    handleResize();
    window.addEventListener("resize", handleResize, true);
    return () => {
      window.removeEventListener("resize", handleResize, true);
    };
  }, []);
}
