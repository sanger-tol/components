/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { VideoPlayer } from "../tol-ui/src";

export function Sandbox() {
  return (<>
    <div style={{height:500, width:500, backgroundColor:"red"}}>
      <VideoPlayer videoId="bWDvccrSAL4" width={300} height={300}/>
    </div>
    <p>Hello</p>
    <div style={{height:500, width:500, backgroundColor:"blue"}}>
      <VideoPlayer videoId="bWDvccrSAL4" width={500}/>
    </div>
    <p>Hello</p>
    <div style={{height:500, width:500, backgroundColor:"green"}}>
      <VideoPlayer videoId="bWDvccrSAL4" height={500}/>
    </div>
    <p>Hello</p>
    <div style={{height:500, width:500, backgroundColor:"yellow"}}>
      <VideoPlayer videoId="bWDvccrSAL4"/>
    </div>
    <p>Hello</p>
    </>
  );
}
