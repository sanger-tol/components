/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  ObjectDetail,
  RemoteComponentDataList,
} from "..";
import type {
  IRemoteComponentDataList,
  PObjectDetailOptions
} from "..";


/** Props for the `RemoteObjectDetail` component. */
export interface PRemoteObjectDetail extends PObjectDetailOptions, IRemoteComponentDataList {}

/** A remote version of the `ObjectDetail` component that fetches its data remotely. */
export function RemoteObjectDetail(props: PRemoteObjectDetail) {
  return (
    <RemoteComponentDataList pageSize={50} {...props}>
      <ObjectDetail {...props} />
    </RemoteComponentDataList>
  );
}
