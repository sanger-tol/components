/*
 * SPDX-FileCopyrightText: 2026 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

/**
 * Returns the CSS class for a button wrapper `div` based on the given position.
 * Returns `undefined` when position is `"none"` so no class attribute is rendered.
 */
export function getButtonWrapperClass(position: "left" | "right" | "center" | "none") {
  return position !== "none" ? `tol-button-wrapper-${position}` : undefined;
}
