/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect } from "react";

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
  useEffect(() => {
    fn();
    const handleResize = () => fn();
    window.addEventListener("resize", handleResize, true);
    return () => {
      window.removeEventListener("resize", handleResize, true);
    };
  }, [fn]);
}
