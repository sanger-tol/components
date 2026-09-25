/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  ObjectDetail,
  RemoteComponentDataList,
} from "..";
import type { IRemoteComponentDataList } from "..";

export function RemoteObjectDetail(props: IRemoteComponentDataList) {
  return (
    <RemoteComponentDataList {...props}>
      <ObjectDetail {...props}/>
    </RemoteComponentDataList>
  );
}
