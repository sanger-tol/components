/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";

/**
 * A hook that allows for a fallback state to be used if an external state is not provided.
 * @param externalState The external state to use if provided.
 * @param externalSetState The external setState function to use if provided.
 * @param defaultValue The default value to use if no external state is provided.
 * @returns A tuple containing the state and setState function.
 */
export function useStateFallback<T>(
  externalState: T | undefined,
  externalSetState: ((state: T) => void) | undefined,
  defaultValue: T
): [T, (state: T) => void] {
  const [internalState, setInternalState] = useState<T>(defaultValue);
  const isExternal = externalState !== undefined && externalSetState !== undefined;
  const state = isExternal ? externalState : internalState;
  const setState = isExternal ? externalSetState : setInternalState;
  return [state, setState];
}