/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { VideoPlayer } from "../tol-ui/src";

export function Sandbox() {
  return (<>
    <div style={{height:1000, width:1000}}>
      <VideoPlayer videoId="bWDvccrSAL4" width={300} height={300}/>
    </div>
    <p>Hello</p>
    </>
  );
}
