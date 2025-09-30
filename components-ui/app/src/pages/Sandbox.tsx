/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { VideoPlayer } from "../tol-ui/src";

export function Sandbox() {
  const videoJsOptions = {
  techOrder: ["youtube"],
  sources: [{
    type: "video/youtube", 
        src: "https://www.youtube.com/watch?v=SqcY0GlETPk", 
  }],
  controls: true,
  autoplay: false,
};

  return (
    <>
      <VideoPlayer options={videoJsOptions} />
    </>
  );
}
