/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect } from "react";

/** Returns whether the browser currently prefers a dark color scheme. */
export function isDarkMode(): boolean {
  return (
    typeof window !== "undefined" &&
    !!window.matchMedia?.("(prefers-color-scheme: dark)").matches
  );
}

/**
 * Runs a callback on mount and whenever the browser color-scheme preference changes.
 *
 * @param fn Callback invoked immediately and on each theme change event.
 */
export function themeListener(fn: () => void): void {
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


