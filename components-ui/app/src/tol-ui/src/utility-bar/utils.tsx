/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { PUtilityBar } from "..";


/**
 * Merges two Utility Bar configuration objects into a single configuration.
 *
 * Combines top-level metadata by preferring values from {@link additions} and
 * falling back to {@link initial} when a field is missing/empty on {@link additions}.
 * Concatenates `elements` and `buttons` arrays in order: initial items first, then additions.
 *
 * @param initial - The primary Utility Bar configuration.
 * @param additions - Optional secondary configuration to supplement missing fields and append additional items.
 * @returns A merged {@link PUtilityBar} configuration containing the resolved metadata and concatenated arrays.
 */
export function mergeUtilityBarConfigs(
  initial: PUtilityBar,
  additions?: PUtilityBar
): PUtilityBar {
  return {
    id: initial.id,
    title: additions?.title || initial.title,
    description: additions?.description || initial.description,
    elements: [
      ...(initial.elements || []),
      ...(additions?.elements || []),
    ],
    buttons: [
      ...(initial.buttons || []),
      ...(additions?.buttons || []),
    ],
  };
}
