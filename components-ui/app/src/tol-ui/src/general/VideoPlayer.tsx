/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import videojs from "video.js";
import { useEffect, useRef } from "react";
import "videojs-youtube";
import "video.js/dist/video-js.css";
import { TVideoConfig } from "..";

export interface IVideoSetter {
  options: TVideoConfig;
}

export function VideoPlayer(props: IVideoSetter) {
  const { options } = props;
  const videoNode = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<videojs.Player | null>(null);

  useEffect(() => {
    if (videoNode.current) {
      playerRef.current = videojs(videoNode.current, options, () => {
        videojs.log("on Player ready", playerRef.current);
      });
      return () => {
        if (playerRef.current) {
          playerRef.current.dispose();
        }
      };
    }
  }, [options]);

  return (
    <div data-vjs-player>
      <video ref={videoNode} className="video-js" />
    </div>
  );
}
