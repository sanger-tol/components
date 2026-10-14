/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useLayoutEffect, useRef } from "react";
import type { RefObject } from "react";


/**
 * Calls a callback immediately and whenever the referenced element or selected targets are resized.
 * The callback is kept current without reconnecting the observer, and the observer is disconnected on unmount.
 *
 * @param componentRef - Ref to the element whose size should be observed.
 * @param callback - Function to call initially and after observed elements resize.
 * @param observeSelector - Optional CSS selector for additional elements to observe.
 */
export function useOnResize(
  componentRef: RefObject<Element | null>,
  callback: () => void,
  observeSelector?: string,
): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useLayoutEffect(() => {
    const handleResize = () => callbackRef.current();
    let observer: ResizeObserver | undefined;
    let frameId: number | undefined;

    const attachObserver = () => {
      const element = componentRef.current;

      if (!element) {
        frameId = window.requestAnimationFrame(attachObserver);
        return;
      }

      handleResize();

      if (typeof ResizeObserver !== "undefined") {
        observer = new ResizeObserver(handleResize);
        observer.observe(element);
        if (observeSelector) {
          document.querySelectorAll(observeSelector).forEach((target) => observer?.observe(target));
        }
      }
    };

    attachObserver();

    return () => {
      if (frameId !== undefined) window.cancelAnimationFrame(frameId);
      observer?.disconnect();
    };
  }, [componentRef, observeSelector]);
}