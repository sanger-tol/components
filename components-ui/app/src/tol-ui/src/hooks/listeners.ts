/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { RefObject, useEffect, useLayoutEffect, useRef } from "react";

/**
 * Returns whether the browser currently prefers a dark color scheme.
 */
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

/**
 * Runs a callback on mount and whenever the browser window is resized.
 *
 * @param fn Callback invoked immediately and on each window resize event.
 */
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

/**
 * Runs a callback once the provided element ref is attached and whenever it is resized.
 *
 * @param componentRef Ref for the element to observe.
 * @param fn Callback invoked after the element is available and on each observed
 * resize event.
 */
export function componentResizeListener(
  componentRef: RefObject<Element | null>,
  fn: () => void,
): void {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useLayoutEffect(() => {
    const handleResize = () => fnRef.current();
    let observer: ResizeObserver | undefined;
    let frameId: number | undefined;

    const attachObserver = () => {
      const element = componentRef.current;

      if (!element) {
        // Retry on the next frame until the ref target is attached.
        frameId = window.requestAnimationFrame(attachObserver);
        return;
      }

      // Run once when the element first becomes available for the initial measurement.
      handleResize();

      if (typeof ResizeObserver !== "undefined") {
        // Keep the callback in sync with later size changes.
        observer = new ResizeObserver(() => handleResize());
        observer.observe(element);
      }
    };

    attachObserver();

    return () => {
      if (frameId !== undefined) {
        window.cancelAnimationFrame(frameId);
      }

      // Stop observing if setup reached the observer stage.
      observer?.disconnect();
    };
  }, [componentRef]);
}

