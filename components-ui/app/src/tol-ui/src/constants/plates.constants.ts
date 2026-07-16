/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export const ALPHABET: string = "abcdefghijklmnopqrstuvwxyz".toUpperCase();
export const PLATE_DIMENSIONS: { [key: string]: { x: number; y: number } } = {
  "96": { x: 12, y: 8 },
  "384": { x: 24, y: 16 },
};
