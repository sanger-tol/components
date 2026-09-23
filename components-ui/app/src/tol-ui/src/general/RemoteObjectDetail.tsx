/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  ObjectDetail,
  RemoteComponentList,
} from "..";
import type { IRemoteComponentData } from "..";

export function RemoteObjectDetail(props: IRemoteComponentData) {
  return (
    <RemoteComponentList {...props}>
      <ObjectDetail {...props}/>
    </RemoteComponentList>
  );
}
