/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { DataPoints } from "..";
import type { IFieldMeta, TField, TCustomDataPointRenderers, TDataObjectListOrNull, TDataRecord, TsDataSource, TDataRecordList } from "..";

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

/**
 * Converts a list of data objects into `TDataRecord`s (one per row), rendering each active field via
 * `DataPoints` using its merged metadata - the generic, non-table equivalent of `convertTableData`.
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
    for (const field of fieldMeta.order.active) {
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

/** Joins class names, ignoring any falsy values. */
export function joinClassNames(...classNames: (string | undefined | null | false)[]): string {
  return classNames.filter(Boolean).join(" ");
}
