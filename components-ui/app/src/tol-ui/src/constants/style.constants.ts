/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

/** A set of common colour constants used throughout the application. */
export const COLOURS = {
  PRIMARY: "primary",
  SUCCESS: "success",
  WARNING: "warning",
  DANGER: "danger",
  BACKGROUND: "bg",
  GREY: "grey"
} as const;

/** Colours that when used as a background should have dark foreground text. */
export const LIGHT_COLOURS = {
  BACKGROUND: "bg",
  GREY: "grey"
} as const;
