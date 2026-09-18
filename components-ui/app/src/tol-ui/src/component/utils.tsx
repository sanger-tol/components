/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { IFieldMeta, TField } from "..";

/**
 * Looks up a field's metadata, preferring defaults over the field's own configuration.
 *
 * @param fields - The field metadata to look up the attribute in.
 * @param attribute - The identifier of the field to look up.
 * @returns The field's metadata, or `undefined` if not present in either `dataWithDefaults` or `data`.
 */
export function getField(fields: IFieldMeta, attribute: string): TField | undefined {
  return fields.dataWithDefaults?.[attribute] ?? fields.data?.[attribute];
}

/** Joins class names, ignoring any falsy values. */
export function joinClassNames(...classNames: (string | undefined | null | false)[]): string {
  return classNames.filter(Boolean).join(" ");
}
