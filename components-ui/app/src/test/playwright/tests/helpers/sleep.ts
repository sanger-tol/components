// SPDX-FileCopyrightText: 2025 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

/**
 * Pauses the test for `ms` miliseconds.
 * 
 * You should avoid this at all costs and use it as a last resort.
 * Prefer approaches such as waiting for an element to attach or for DOM content to load.
 * @param ms The number of miliseconds to wait for
 */
export async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
