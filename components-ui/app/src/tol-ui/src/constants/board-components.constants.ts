/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

/**
 * The sizing parameters to pass to react-grid-layout
 * for each size of visualisation/component.
 * 
 * Component sizes are on the left; their breakpoints are on the right
 * (both are called sm, md and lg but mean different things).
 * The sizes are not capitalised so that they match `widget_type` from `IComponent`.
 */
export const VISUALISATION_BREAKPOINTS = {
  sm: { lg: { w: 1, h: 10 }, md: { w: 1, h: 10 }, sm: { w: 1, h: 10 } },
  md: { lg: { w: 2, h: 30 }, md: { w: 2, h: 30 }, sm: { w: 1, h: 30 } },
  lg: { lg: { w: 4, h: 40 }, md: { w: 2, h: 40 }, sm: { w: 1, h: 40 } },
} as const;
