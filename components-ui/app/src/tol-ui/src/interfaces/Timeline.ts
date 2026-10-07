/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { IComponentData } from "./Component";
import type { IFieldBasic } from "./Field";

/** Marker metadata for a timeline field. */
export interface IFieldTimeline extends IFieldBasic {
  /** Grey if undefined, otherwise the supplied colour. */
  color?: string;
  /** Small dot if undefined, otherwise a larger circle with this FontAwesome icon. */
  icon?: string;
}

/** Timeline display options using shared field metadata and component data. */
export interface ITimeline extends IComponentData {
  /** Timeline endless */
  endless?: boolean;
  /** Hide undefined. */
  hideUndefined?: boolean;
  /** Hide future date. */
  hideFuture?: boolean;
  /** Hide past  date. */
  hidePast?: boolean;
  /** Show field descriptions below labels; defaults to true. */
  showDescription?: boolean;
}
