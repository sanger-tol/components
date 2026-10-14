/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { RefObject, useEffect } from "react";

/**
 * Tracks whether an element has reached its sticky position while the window scrolls.
 * Sets the provided CSS custom property to "1" after the element sticks and "0" otherwise,
 * and removes the scroll listener when the effect is cleaned up.
 *
 * @param elementRef - Ref to the sticky element to track.
 * @param cssVariable - CSS custom property name to set on the element.
 */
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