/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useLayoutEffect, useRef } from "react";
import type { RefObject } from "react";


/** Calls a callback when the referenced element or optional selector targets are resized. */
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