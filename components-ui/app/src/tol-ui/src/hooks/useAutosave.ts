/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useCallback, useEffect, useRef, useState } from "react";
import { AUTOSAVE_DELAY_MS } from "..";
import type {
  IUseAutosaveOptions,
  IUseAutosaveResult,
  TAutosaveStatus,
} from "..";

/**
 * Debounces saving a changing value and tracks its save status.
 *
 * The initial value is treated as already saved. When enabled, changes restart
 * the debounce timer. Saves are serialized so only one request runs at a time.
 *
 * @typeParam T - The type of value being saved.
 * @param options - The value, save callback, and autosave configuration.
 * @param options.value - The current value. Object values should be immutable.
 * @param options.save - Async callback that persists a snapshot of the value.
 * @param options.enabled - Enables automatic saving when truthy.
 * Does not prevent manual saves or cancel an in-flight request.
 * @param options.delayMs - Debounce delay in milliseconds.
 * Defaults to `AUTOSAVE_DELAY_MS`.
 * @param options.hasPendingChanges - Returns true when current and saved values differ.
 * Defaults to negating `Object.is`, which compares objects by reference.
 * @returns The save status, last successful save time, dirty flag, and controls:
 * - `flush`: Cancels the debounce timer, waits for any active save, and saves
 *   the latest value if dirty. Rejects if that save fails.
 * - `retry`: An alias for `flush`.
 * - `resetBaseline`: Marks a supplied value as saved, cancels the debounce
 *   timer, and resets the status to idle. Does not cancel an active save.
 *
 * @remarks
 * Registers a browser unload warning while dirty or saving. Pending debounce
 * timers are cleared on cleanup; unmounting does not flush unsaved changes.
 */
export function useAutosave<T>(
  options: IUseAutosaveOptions<T>,
): IUseAutosaveResult<T> {
  const {
    value,
    save,
    enabled,
    delayMs = AUTOSAVE_DELAY_MS,
    hasPendingChanges = (currentValue: T, savedValue: T) =>
      !Object.is(currentValue, savedValue),
  } = options;

  const [status, setStatus] = useState<TAutosaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const savedValueRef = useRef<T>(value);
  const latestValueRef = useRef<T>(value);
  const inFlightRef = useRef<Promise<void> | null>(null);
  const timerRef = useRef<number | undefined>(undefined);
  const saveRef = useRef(save);
  const hasPendingChangesRef = useRef(hasPendingChanges);

  saveRef.current = save;
  hasPendingChangesRef.current = hasPendingChanges;
  latestValueRef.current = value;

  const isDirty = hasPendingChangesRef.current(value, savedValueRef.current);

  const flush = useCallback(async (): Promise<void> => {
    clearTimeout(timerRef.current);

    while (inFlightRef.current) {
      await inFlightRef.current.catch(() => undefined);
    }

    const snapshot = latestValueRef.current;
    if (!hasPendingChangesRef.current(snapshot, savedValueRef.current)) return;

    setStatus("saving");
    const request = saveRef
      .current(snapshot)
      .then(() => {
        savedValueRef.current = snapshot;
        setLastSavedAt(new Date());
        setStatus(
          hasPendingChangesRef.current(latestValueRef.current, snapshot)
            ? "pending"
            : "saved",
        );
      })
      .catch((error) => {
        setStatus("error");
        throw error;
      })
      .finally(() => {
        inFlightRef.current = null;
      });

    inFlightRef.current = request;
    return request;
  }, []);

  const resetBaseline = useCallback((nextValue: T) => {
    window.clearTimeout(timerRef.current);
    savedValueRef.current = nextValue;
    latestValueRef.current = nextValue;
    setStatus("idle");
  }, []);

  useEffect(() => {
    if (!enabled || !isDirty) {
      return;
    }

    setStatus("pending");
    timerRef.current = window.setTimeout(() => {
      void flush().catch(() => undefined);
    }, delayMs);

    return () => window.clearTimeout(timerRef.current);
  }, [enabled, value, isDirty, delayMs, flush]);

  useEffect(() => {
    if (!isDirty && status !== "saving") return;

    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [isDirty, status]);

  return { status, lastSavedAt, isDirty, flush, retry: flush, resetBaseline };
}
