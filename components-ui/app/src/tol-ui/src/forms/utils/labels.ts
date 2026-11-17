/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

/**
 * Strips colons and surrounding whitespace from a label.
 *
 * @param value - The raw label.
 * @returns The cleaned label.
 */
export function cleanTitle(value: string): string {
  return value.replace(/:/g, "").trim();
}

/**
 * Converts a snake_case key into a human-readable, title-cased label.
 *
 * @param value - The raw key (e.g. `assembly_metrics`).
 * @returns The prettified label (e.g. `Assembly Metrics`).
 */
export function prettify(value: string): string {
  return cleanTitle(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
