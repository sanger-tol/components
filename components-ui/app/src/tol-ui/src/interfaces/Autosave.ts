/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/
import type { TAutosaveStatus } from "..";

/** Configuration for saving values of type T. */
export interface IUseAutosaveOptions<T> {
  /** Current value; object values should be immutable. */
  value: T;
  /** Persists a snapshot of the current value. */
  save: (value: T) => Promise<void>;
  /** Enables automatic saving without preventing manual saves. */
  enabled?: boolean;
  /** Debounce delay in milliseconds; defaults to AUTOSAVE_DELAY_MS. */
  delayMs?: number;
  /** Returns true when current and saved values differ; defaults to !Object.is. */
  hasPendingChanges?: (currentValue: T, savedValue: T) => boolean;
}

/** Save state and controls returned by useAutosave. */
export interface IUseAutosaveResult<T> {
  /** Status of the current save cycle. */
  status: TAutosaveStatus;
  /** Time of the last successful save, or null before the first success. */
  lastSavedAt: Date | null;
  /** Whether the current value differs from the saved baseline. */
  isDirty: boolean;
  /** Saves pending changes after any active save; rejects on failure. */
  flush: () => Promise<void>;
  /** Retries saving pending changes; an alias for flush. */
  retry: () => Promise<void>;
  /** Marks a value as saved without cancelling an active save. */
  resetBaseline: (nextValue: T) => void;
}