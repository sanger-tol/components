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
  endless?: boolean;
  /** Order by date first, then booleans in fields.order.active order. */
  orderByDateFirst?: boolean;
  hideUndefined?: boolean;
  hideFuture?: boolean;
  hidePast?: boolean;
}
