/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useLayoutEffect, useRef } from "react";

export function isDarkMode(): boolean {
  return (
    typeof window !== "undefined" &&
    !!window.matchMedia?.("(prefers-color-scheme: dark)").matches
  );
}

export function themeListener(fn) {
  useEffect(() => {
    fn();
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => fn();

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);
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
