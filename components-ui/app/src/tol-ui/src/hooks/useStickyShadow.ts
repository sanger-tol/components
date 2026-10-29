/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { RefObject, useCallback, useEffect } from "react";

/**
 * Tracks whether an element has reached its sticky position while the window scrolls.
 * Sets the provided CSS custom property to "1" after the element sticks and "0" otherwise,
 * and removes the scroll listener when the effect is cleaned up.
 *
 * The element is read from the ref on every update, so it keeps working if the element is
 * re-created (e.g. the component switches between rendering it and something else).
 *
 * @param elementRef - Ref to the sticky element to track.
 * @param cssVariable - CSS custom property name to set on the element.
 */
export function useStickyShadow(
  elementRef: RefObject<HTMLElement | null>,
  cssVariable: string,
): void {
  const updateStickyState = useCallback(() => {
    const element = elementRef.current;
    if (!element) return;

    const stickyTop = parseFloat(window.getComputedStyle(element).top) || 0;
    // 1px tolerance as a stuck element can sit a sub-pixel away from its computed offset
    const hasReachedStickyPosition =
      window.scrollY > 0 && element.getBoundingClientRect().top <= stickyTop + 1;
    element.style.setProperty(cssVariable, hasReachedStickyPosition ? "1" : "0");
  }, [cssVariable, elementRef]);

  useEffect(() => {
    window.addEventListener("scroll", updateStickyState, { passive: true });
    window.addEventListener("resize", updateStickyState, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateStickyState);
      window.removeEventListener("resize", updateStickyState);
    };
  }, [updateStickyState]);

  // Re-sync after every render, as a newly created element has no value until the next scroll
  useEffect(() => {
    updateStickyState();
  });
}