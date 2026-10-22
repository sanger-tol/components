/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { DataPoints, deepCopy } from "..";
import type { IFieldMeta, IRecordRange, TField, TCellRenderer, TCustomDataPointRenderers, TDataObjectListOrNull, TDataRecord, TsDataSource, TDataRecordList } from "..";

/** Resolves the default data point renderer for an attribute's Python type. */
export function addDefaultDataPointRenderer(type?: string): TCellRenderer {
  switch (type) {
    case "datetime":
      return { type: "datetime" };
    case "bool":
      return { type: "boolean" };
  }
}

/**
 * Ensures component field metadata has the maps and active-field order required by list rendering.
 *
 * @param fieldMeta Field metadata from component props or persisted configuration.
 * @returns Complete field metadata, defaulting missing maps and active fields to empty values.
 */
export function normaliseFieldMeta(fieldMeta?: Partial<IFieldMeta>): IFieldMeta {
  return {
    ...fieldMeta,
    data: fieldMeta?.data ?? {},
    dataWithDefaults: fieldMeta?.dataWithDefaults ?? {},
    order: {
      ...fieldMeta?.order,
      active: Array.isArray(fieldMeta?.order?.active) ? fieldMeta.order.active : [],
    },
  };
}

/**
 * Removes derived field metadata before saving component configuration.
 *
 * @param fieldMeta - The field metadata to persist.
 * @returns A copy of the field metadata without `dataWithDefaults`.
 */
export function optimiseFieldMetaForSave(fieldMeta?: IFieldMeta): IFieldMeta {
  const fm = deepCopy(normaliseFieldMeta(fieldMeta));
  delete fm.dataWithDefaults;
  return fm;
}

/**
 * Looks up a field's metadata, preferring defaults over the field's own configuration.
 *
 * @param fields - The field metadata to look up the attribute in.
 * @param attribute - The identifier of the field to look up.
 * @returns The field's metadata, or `undefined` if not present in either `dataWithDefaults` or `data`.
 */
export function getField(fields: IFieldMeta, attribute: string): TField | undefined {
  return fields.data?.[attribute] ?? fields.dataWithDefaults?.[attribute];
}

/**
 * Converts a list of data objects into `TDataRecord`s (one per row), rendering
 * each active field via `DataPoints` using its merged metadata.
 *
 * @param dataObjects - The data objects to convert, e.g. from `dataSource.getListPage`.
 * @param dataSource - The data source the objects belong to.
 * @param fieldMeta - Field metadata describing which fields to render and how.
 * @param customDataPointRenderers - Custom cell renderers to use in addition to the pre-defined ones.
 * @returns One `TDataRecord` per data object, keyed by attribute.
 */
export function buildDataRecords(
  dataObjects: TDataObjectListOrNull,
  dataSource: TsDataSource,
  fieldMeta: IFieldMeta,
  customDataPointRenderers?: TCustomDataPointRenderers,
): TDataRecordList {
  if (!dataObjects) return [];

  return dataObjects.map((dataObject) => {
    const record: TDataRecord = {};
    for (const field of fieldMeta?.order?.active ?? []) {
      record[field] = (
        <DataPoints
          field={field}
          dataObject={dataObject}
          dataSource={dataSource}
          meta={getField(fieldMeta, field) ?? {}}
          customCellRenderers={customDataPointRenderers}
        />
      );
    }
    return record;
  });
}

/**
 * Joins class names, ignoring any falsy values.
 *
 * @param classNames - Class names to join.
 * @returns The joined class names, separated by spaces.
 */
export function joinClassNames(...classNames: (string | undefined | null | false)[]): string {
  return classNames.filter(Boolean).join(" ");
}

/**
 * Calculates the first and last record numbers shown on the current page.
 *
 * @param totalSize - The total number of records.
 * @param page - The current page, starting at 1.
 * @param pageSize - The number of records displayed per page.
 * @returns The inclusive range of displayed records, or 0 to 0 when there are no records.
 */
export function getRecordRange(
  totalSize: number,
  page = 1,
  pageSize?: number,
): IRecordRange {
  if (totalSize === 0) return { start: 0, end: 0 };

  const start = pageSize === undefined ? 1 : (page - 1) * pageSize + 1;
  const end = pageSize === undefined ? totalSize : Math.min(page * pageSize, totalSize);
  return { start, end };
}

/**
 * Formats a total size with localized number separators.
 *
 * @param totalSize - The total number of records.
 * @returns The formatted record count.
 */
export function formatTotalSize(totalSize: number): string {
  return totalSize.toLocaleString();
}

/**
 * Formats a record range using localized numbers and a compact separator.
 *
 * @param start - The first record number in the range.
 * @param end - The last record number in the range.
 * @returns The formatted range, e.g. "1–10".
 */
export function formatRecordRange(start: number, end: number): string {
  return `${start.toLocaleString()}–${end.toLocaleString()}`;
}
