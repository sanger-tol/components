/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { RefObject, useEffect } from "react";

/** Sets a CSS custom property when an element reaches its sticky position after scrolling. */
export function useStickyShadow(
  elementRef: RefObject<HTMLElement | null>,
  cssVariable: string,
): void {
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const updateStickyState = () => {
      const stickyTop = parseFloat(window.getComputedStyle(element).top) || 0;
      const hasReachedStickyPosition =
        window.scrollY > 0 && element.getBoundingClientRect().top <= stickyTop;
      element.style.setProperty(cssVariable, hasReachedStickyPosition ? "1" : "0");
    };

    updateStickyState();
    window.addEventListener("scroll", updateStickyState, { passive: true });
    return () => window.removeEventListener("scroll", updateStickyState);
  }, [cssVariable, elementRef]);
}