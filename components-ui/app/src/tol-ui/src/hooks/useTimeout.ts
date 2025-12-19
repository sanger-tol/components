/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useCallback, useEffect, useRef, useState } from "react";

export type TimeoutCallback = () => void | Promise<void>;

/**
 * A custom React hook that manages a timeout with start, clear, and reset capabilities.
 *
 * @param callback - The function to execute when the timeout completes. Can be synchronous or asynchronous.
 * @param delayMs - The delay in milliseconds before executing the callback. If null, the timeout will not run.
 * @param options - Configuration options for the timeout behavior.
 * @param options.enabled - Whether the timeout is enabled. Defaults to true.
 * @param options.startOnMount - Whether to automatically start the timeout when the component mounts. Defaults to true.
 *
 * @returns An object containing:
 * - `start`: Function to start the timeout. Accepts an optional `restart` parameter to clear existing timeout first.
 * - `clear`: Function to cancel the current timeout.
 * - `reset`: Function to restart the timeout (equivalent to calling start with restart=true).
 * - `isRunning`: Boolean indicating whether a timeout is currently active.
 */

export interface IUseTimeoutOptions {
  enabled?: boolean;
  startOnMount?: boolean;
}

export function useTimeout(
  callback: TimeoutCallback,
  delayMs: number | null,
  options: IUseTimeoutOptions = {}
) {
  const { enabled = true, startOnMount = true } = options;

  const callbackRef = useRef<TimeoutCallback>(callback);
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const clear = useCallback(() => {
    if (timeoutIdRef.current !== null) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const start = useCallback(
    (restart = true) => {
      if (delayMs === null) return;
      if (restart) clear();
      if (timeoutIdRef.current !== null) return;

      timeoutIdRef.current = setTimeout(async () => {
        try {
          await callbackRef.current();
        } finally {
          timeoutIdRef.current = null;
          setIsRunning(false);
        }
      }, delayMs);

      setIsRunning(true);
    },
    [clear, delayMs]
  );

  const reset = useCallback(() => start(true), [start]);

  useEffect(() => {
    if (!enabled) {
      clear();
      return;
    }
    if (!startOnMount || delayMs === null) return;

    start(true);
    return clear;
  }, [enabled, startOnMount, delayMs, start, clear]);
  return { start, clear, reset, isRunning };
}
