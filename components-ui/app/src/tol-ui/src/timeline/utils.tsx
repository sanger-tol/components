/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { getField } from "..";
import type { IFieldTimeline, ITimeline } from "..";

/**
 * Selects and orders timeline fields without modifying their metadata or values.
 * @param props - Field selection, data, and timeline visibility options.
 * @param now - Reference time used by the past and future filters.
 * @returns Events sorted by date, then booleans and missing values in active field order.
 */
export function getTimelineFields(props: ITimeline, now = new Date()) {
  const {
    fields, data = {},
    hideUndefined = false, hideFuture = false, hidePast = false,
  } = props;

  const events = [...new Set(fields?.order.active ?? [])].flatMap((attribute) => {
    const field: IFieldTimeline = fields ? getField(fields, attribute) ?? {} : {};
    const value = data[attribute];
    const parsedDate = typeof value === "string" && value.trim() !== "" ? new Date(value) : undefined;
    const date = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : undefined;
    const isUndefined = !date && typeof value !== "boolean";

    if (hideUndefined && isUndefined) return [];
    if (date && hideFuture && date.getTime() > now.getTime()) return [];
    if (date && hidePast && date.getTime() < now.getTime()) return [];

    return [{ attribute, field, date, value: typeof value === "boolean" ? value : undefined }];
  });

  return events.sort((first, second) => {
    if (first.date && second.date) return first.date.getTime() - second.date.getTime();
    if (first.date) return -1;
    if (second.date) return 1;
    return 0;
  });
}
