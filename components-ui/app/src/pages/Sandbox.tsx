/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useRef } from "react";
import { VideoPlayer } from "../tol-ui/src";

export function Sandbox() {
  const videoJsOptions = {
    autoplay: true,
    controls: true,
    sources: [
      {
        src: "https://www.w3schools.com/html/mov_bbb.mp4",
        type: "video/mp4",
      },
    ],
  };

  return (
    <>
      <VideoPlayer options={videoJsOptions} />
    </>
  );
}
