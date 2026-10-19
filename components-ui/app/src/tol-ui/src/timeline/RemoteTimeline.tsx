/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useCallback } from "react";
import { getDataPointsValue, RemoteComponentDataList, Timeline } from "..";
import type { IFieldMeta, IRemoteComponentDataList, PTimelineOptions, TDataObjectListOrNull } from "..";

/** Props for the remote Timeline component. */
export interface PRemoteTimeline extends PTimelineOptions, IRemoteComponentDataList { }

/** Fetches one remote record and displays its selected fields as a timeline. */
export function RemoteTimeline(props: PRemoteTimeline) {

  // TODO: Remove for 'proper' implementation in config drawer
  const addCheckIcons = useCallback((fields: IFieldMeta): IFieldMeta => ({
    ...fields,
    dataWithDefaults: {
      ...fields.dataWithDefaults,
      ...Object.fromEntries(
        (fields.order?.active ?? []).map((attribute) => [
          attribute,
          {
            ...fields.dataWithDefaults?.[attribute],
            icon: "check",
            color: "var(--tol-success)",
          },
        ]),
      ),
    },
  }), []);

  // TODO: Remove for 'proper' implementation in config drawer
  const sortFieldsByDate = useCallback((fields: IFieldMeta, dataObjects?: TDataObjectListOrNull): IFieldMeta => {
    const dataObject = dataObjects?.[0];
    if (!dataObject) return fields;

    const dated: { field: string; first: Date }[] = [];
    const remaining: string[] = [];

    (fields.order?.active ?? []).forEach((field) => {
      const values = getDataPointsValue(dataObject, field)
        .filter((value) => value !== null && value !== undefined && value !== "");

      if (values.length === 0) return;

      if (fields.dataWithDefaults?.[field]?.type !== "datetime") {
        remaining.push(field);
        return;
      }

      const [first] = values
        .filter((value) => typeof value === "string")
        .map((value) => new Date(value))
        .filter((date) => !Number.isNaN(date.getTime()))
        .sort((a, b) => a.getTime() - b.getTime());

      if (first) dated.push({ field, first });
      else remaining.push(field);
    });

    const active = [
      ...dated.sort((a, b) => a.first.getTime() - b.first.getTime()).map(({ field }) => field),
      ...remaining,
    ];

    return { ...fields, order: { ...fields.order, active } };
  }, []);

  // TODO: Remove for 'proper' implementation in config drawer
  const manipulateViewableFieldMeta = useCallback(
    (fields: IFieldMeta, dataObjects?: TDataObjectListOrNull) =>
      sortFieldsByDate(
        addCheckIcons(fields),
        dataObjects
      ),
    [addCheckIcons, sortFieldsByDate],
  );

  return (
    <RemoteComponentDataList
      {...props}
      manipulateViewableFieldMeta={manipulateViewableFieldMeta}
      componentDefaultPageSize={1}
    >
      <Timeline {...props} />
    </RemoteComponentDataList>
  );
}
