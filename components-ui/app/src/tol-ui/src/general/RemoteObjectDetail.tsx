/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  ObjectDetail,
  RemoteComponentDataList,
} from "..";
import type { TRemoteComponentDataList, PObjectDetailOptions } from "..";


/** Props for the `RemoteObjectDetail` component. */
export interface PRemoteObjectDetail extends PObjectDetailOptions, TRemoteComponentDataList {}

/** A remote version of the `ObjectDetail` component that fetches its data remotely. */
export function RemoteObjectDetail(props: PRemoteObjectDetail) {
  return (
    <RemoteComponentDataList {...props} componentDefaultPageSize={1}>
      <ObjectDetail {...props} />
    </RemoteComponentDataList>
  );
}
