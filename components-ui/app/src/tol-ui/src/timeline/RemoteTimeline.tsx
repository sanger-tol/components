/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { RemoteComponentDataList, Timeline } from "..";
import type { IRemoteComponentDataList, PTimelineOptions } from "..";

/** Props for the remote Timeline component. */
export interface PRemoteTimeline extends PTimelineOptions, IRemoteComponentDataList {}

/** Fetches one remote record and displays its selected fields as a timeline. */
export function RemoteTimeline(props: PRemoteTimeline) {
  const { pageSize = 1, fields } = props;

  // TODO: Make the icons customisable
  const fieldsWithCheckIcons = fields && {
    ...fields,
    dataWithDefaults: {
      ...fields.dataWithDefaults,
      ...Object.fromEntries(
        fields.order.active.map((attribute) => [
          attribute,
          {
            ...fields.dataWithDefaults?.[attribute],
            icon: "check",
            color: "var(--tol-success)",
          },
        ]),
      ),
    },
  };

  return (
    <RemoteComponentDataList {...props} fields={fieldsWithCheckIcons} pageSize={pageSize}>
      <Timeline {...props} fields={fieldsWithCheckIcons} />
    </RemoteComponentDataList>
  );
}
