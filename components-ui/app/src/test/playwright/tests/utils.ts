// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

/**
 * Generates a random integer between 0 and 2,000,000,000.
 * @returns 
 */
export function randomInt() {
  return Math.floor(Math.random() * 2_000_000_000);
}
